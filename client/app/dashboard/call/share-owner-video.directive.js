(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('shareOwnerVideo', directiveFunction)
    .controller('ShareOwnerVideoCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['$q', 'ShareSignaling'];

  /* @ngInject */
  function directiveFunction($q, ShareSignaling) {

    function link(scope, iElement, iAttrs, controller) {

      function Viewer(uid) {

        var isChannelReady = false;
        var isStarted = false;
        var signaling = ShareSignaling({
          sessionid: scope.sessionId,
          channelid: scope.channel.id,
          uid: uid
        });
        var pc = null;

        function sendMessage(message) {
          console.log('Sending message:', message, 'to', uid);
          signaling.writeMessage(message, scope.uid);
        }

        this.onMessage = function(message) {
          console.log('Received message:', message, 'from', uid);
          if (message === 'got user media') {
            isChannelReady = true;
            maybeStart();
          } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));
          } else if (message.type === 'candidate' && isStarted) {
            var candidate = new RTCIceCandidate({
              sdpMLineIndex: message.label,
              candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
          } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
          }
        };

        function maybeStart() {
          console.log('>>>>>>> maybeStart(' + uid + ') ', isStarted, localStream, isChannelReady);
          if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
            console.log('>>>>>> creating peer connection');
            createPeerConnection();
            pc.addStream(localStream);
            isStarted = true;
            doCall();
          }
        }

        function createPeerConnection() {
          try {
            pc = new RTCPeerConnection(null);
            pc.onicecandidate = handleIceCandidate;
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
            console.log('Created RTCPeerConnnection');
          } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
          }
        }

        function handleIceCandidate(event) {
          console.log('icecandidate event: ', event);
          if (event.candidate) {
            sendMessage({
              type: 'candidate',
              label: event.candidate.sdpMLineIndex,
              id: event.candidate.sdpMid,
              candidate: event.candidate.candidate
            });
          } else {
            console.log('End of candidates.');
          }
        }

        function doCall() {
          console.log('Sending offer to peer ', uid);
          pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
        }

        function setLocalAndSendMessage(sessionDescription) {
          // Set Opus as the preferred codec in SDP if Opus is present.
          // sessionDescription.sdp = preferOpus(sessionDescription.sdp);
          pc.setLocalDescription(sessionDescription);
          console.log('setLocalAndSendMessage sending message', sessionDescription);
          sendMessage({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp
          });
        }

        function handleCreateOfferError(event) {
          console.log('createOffer() error: ', event);
        }

        function handleRemoteStreamAdded(event) {
          console.log('Remote stream added. Event:', event);
        }

        function handleRemoteStreamRemoved(event) {
          console.log('Remote stream removed. Event: ', event);
        }

        function handleRemoteHangup() {
          console.log('Session terminated.');
          stop();
        }

        this.hangup = function() {
          if (isStarted) {
            stop();
            sendMessage('bye');
          }
        };

        function stop() {
          isStarted = false;
          pc.close();
          pc = null;
        }

        this.destroy = function() {
          signaling.destroy();
        };

      }

      var viewers = {};
      angular.forEach(scope.friends, function(friend) {
        viewers[friend.uid] = new Viewer(friend.uid);
      });

      var localSignaling = ShareSignaling({
        sessionid: scope.sessionId,
        channelid: scope.channel.id,
        uid: scope.uid
      });

      localSignaling.onMessage(scope, function(data, sessionId, channelId, uid) {
        if (sessionId !== scope.sessionId || channelId !== scope.channel.id || uid !== scope.uid) {
          return;
        }
        var viewer = viewers[data.sender];
        if (!viewer) {
          console.warn('Discarding message received from unknown viewer: ', data.sender);
          return;
        }
        switch (data.signal) {
          case 'message':
            viewer.onMessage(data.value);
            break;
        }
      });

      // var localVideo = iElement[0].querySelector('video');
      
      var localStream;
      var recordingBuffer;
      var recorder;

      var constraints = {
        audio: false,
        video: true
      };

      function onDataAvailable(e) {
        if (e.data) {
          recordingBuffer.push(e.data);
        }
      }

      function gotStream(stream) {
        console.log('Adding local stream.');
        // localVideo.src = window.URL.createObjectURL(stream);
        localStream = stream;

        recordingBuffer = [];
        recorder = new MediaRecorder(stream);
        // will be called each time we get data from stream
        recorder.ondataavailable = onDataAvailable;
        recorder.start();
      }

      function getUserMedia() {
        if (angular.isDefined(scope.stream)) {
          return $q.when(scope.stream);
        } else {
          console.log('Requesting local stream');
          return navigator.mediaDevices.getUserMedia(constraints);
        }
      }

      function start() {
        getUserMedia()
        .then(gotStream)
        .catch(function(e) {
          console.error(e);
          alert('getUserMedia() error: ' + e.name);
        });
      }

      function hangup() {
        console.log('Hanging up.');
        try {
          recorder.stop();
        } catch(e) {
        }
        bufferToDataUrl(function(dataUrl, blob) {
          // upload file to the server
          var file = dataUrlToFile(dataUrl);
          console.log(file);

          // or just download it
          var url = window.URL.createObjectURL(blob);
          var el = document.createElement('a');

          document.body.appendChild(el);
          el.style = 'display: none';
          el.href = url;
          el.download = 'video.webm';
          el.click();
          window.URL.revokeObjectURL(url);
        });
        localStream.getAudioTracks().forEach(function(audioTrack) {
          audioTrack.stop();
        });
        localStream.getVideoTracks().forEach(function(videoTrack) {
          videoTrack.stop();
        });
        // localVideo.src = null;
        angular.forEach(viewers, function(viewer) {
          viewer.hangup();
        });
      }

      function dataUrlToFile(dataUrl) {
        var binary = atob(dataUrl.split(',')[1]);
        var data = [];

        for (var i = 0; i < binary.length; i++) {
          data.push(binary.charCodeAt(i));
        }
        return new File([new Uint8Array(data)], 'recorded-video.webm', {
          type: 'video/webm'
        });
      }

      function bufferToDataUrl(callback) {
        var blob = new Blob(recordingBuffer, {
          type: 'video/webm'
        });

        var reader = new FileReader();
        reader.onload = function() {
          callback(reader.result, blob);
        };
        reader.readAsDataURL(blob);
      }

      // Set Opus as the default audio codec if it's present.
      function preferOpus(sdp) {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].search('m=audio') !== -1) {
            mLineIndex = i;
            break;
          }
        }
        if (mLineIndex === null) {
          return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload) {
              sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            }
            break;
          }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
      }

      function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
      }

      // Set the selected codec to the first in m line.
      function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
          if (index === 3) { // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
          }
          if (elements[i] !== payload) {
            newLine[index++] = elements[i];
          }
        }
        return newLine.join(' ');
      }

      // Strip CN from sdp before CN constraints is ready.
      function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
          var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
          if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
              // Remove CN payload from m line.
              mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
          }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
      }

      ///////////////////////////////////////////

      scope.$on('hangup-share-owner', hangup);

      iElement.ready(start);

      iElement.on('$destroy', function() {
        localSignaling.destroy();
        // remoteSignaling.destroy();
        angular.forEach(viewers, function(viewer) {
          viewer.destroy();
        });
      });
    }

    var directive = {
      restrict: 'E',
      // template: '<video style="max-width: 100%;" autoplay muted></video>',
      template: '',
      scope: {
        stream: '=',
        channel: '=',
        friends: '=',
        sessionId: '@',
        uid: '='
      },
      controller: 'ShareOwnerVideoCtrl',
      link: link
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope'];

  /* @ngInject */
  function ControllerFunction($scope) {
  }

})();
