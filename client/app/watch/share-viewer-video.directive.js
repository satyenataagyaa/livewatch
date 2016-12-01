(function () {

  'use strict';

  angular.module('livewatchApp.watch')
    .directive('shareViewerVideo', directiveFunction)
    .controller('ShareViewerVideoCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['ShareSignaling'];

  /* @ngInject */
  function directiveFunction(ShareSignaling) {

    function link(scope, iElement, iAttrs, controller) {

      var isChannelReady = false;
      var isStarted = false;

      var localSignaling = ShareSignaling({
        sessionid: scope.sessionId,
        channelid: scope.channel.id,
        uid: scope.uid
      });
      var remoteSignaling = ShareSignaling({
        sessionid: scope.sessionId,
        channelid: scope.channel.id,
        uid: scope.channel.owner
      });

      function sendMessage(message) {
        console.log('Sending message: ', message);
        remoteSignaling.writeMessage(message, scope.uid);
      }

      function onMessage(message) {
        console.log('Received message:', message);
        if (message.type === 'offer') {
          if (!isStarted) {
            maybeStart();
          }
          pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
        } else if (message.type === 'candidate' && isStarted) {
          var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
          });
          pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
          handleRemoteHangup();
        }
      }

      localSignaling.onMessage(scope, function(data, sessionId, channelId, uid) {
        if (sessionId !== scope.sessionId || channelId !== scope.channel.id || uid !== scope.uid) {
          return;
        }
        switch (data.signal) {
          case 'message':
            onMessage(data.value);
            break;
        }
      });

      var remoteVideo = iElement[0].querySelector('video');
      
      var pc = null;
      var remoteStream;

      function maybeStart() {
        console.log('>>>>>>> maybeStart() ', isStarted, isChannelReady);
        if (!isStarted && isChannelReady) {
          console.log('>>>>>> creating peer connection');
          createPeerConnection();
          // pc.addStream(localStream);
          isStarted = true;
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

      function doAnswer() {
        console.log('Sending answer to peer.');
        pc.createAnswer().then(
          setLocalAndSendMessage,
          onCreateSessionDescriptionError
        );
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

      function onCreateSessionDescriptionError(error) {
        console.error('Failed to create session description: ' + error.toString());
      }

      function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        remoteVideo.src = window.URL.createObjectURL(event.stream);
        remoteStream = event.stream;
      }

      function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
      }

      function start() {
        isChannelReady = true;
        sendMessage('got user media');
      }

      function hangup() {
        console.log('Hanging up.');
        remoteStream.getAudioTracks().forEach(function(audioTrack) {
          audioTrack.stop();
        });
        remoteStream.getVideoTracks().forEach(function(videoTrack) {
          videoTrack.stop();
        });
        remoteVideo.src = null;
        if (isStarted) {
          stop();
          sendMessage('bye');
        }
      }

      function handleRemoteHangup() {
        console.log('Session terminated.');
        remoteStream.getAudioTracks().forEach(function(audioTrack) {
          audioTrack.stop();
        });
        remoteStream.getVideoTracks().forEach(function(videoTrack) {
          videoTrack.stop();
        });
        remoteVideo.src = null;
        stop();
      }

      function stop() {
        isStarted = false;
        pc.close();
        pc = null;
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

      scope.$on('hangup-share-viewer', hangup);

      iElement.ready(start);

      iElement.on('$destroy', function() {
        localSignaling.destroy();
        remoteSignaling.destroy();
      });
    }

    var directive = {
      restrict: 'E',
      // template: '<video style="max-width: 100%;" autoplay muted></video>',
      template: '<video class="share-viewer" ng-class="channel.type" autoplay muted></video>',
      scope: {
        channel: '=',
        sessionId: '@',
        uid: '='
      },
      controller: 'ShareViewerVideoCtrl',
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