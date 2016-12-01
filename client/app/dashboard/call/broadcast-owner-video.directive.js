(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('broadcastOwnerVideo', directiveFunction)
    .controller('BroadcastOwnerVideoCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['BroadcastSignaling'];

  /* @ngInject */
  function directiveFunction(BroadcastSignaling) {

    function link(scope, iElement, iAttrs, controller) {

      function Viewer(uid) {

        var isChannelReady = false;
        var isStarted = false;
        var signaling = BroadcastSignaling({
          sessionid: scope.sessionId,
          channelid: scope.channel.id,
          uid: uid
        });
        var pc = null;

        function sendMessage(message) {
          console.log('Sending message: ', message, ' to ', uid);
          signaling.writeMessage(message, scope.uid);
        }

        this.onMessage = function(message) {
          console.log('Received message:', message, 'from', uid);
          if (message === 'got user media') {
            // if (isInitiator) {
            //   isChannelReady[sender] = true;
            // }
            isChannelReady = true;
            maybeStart();
          // } else if (message.type === 'offer') {
          //   if (!isInitiator && !isStarted) {
          //     maybeStart();
          //   }
          //   pc.setRemoteDescription(new RTCSessionDescription(message));
          //   doAnswer();
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
            // console.log('isInitiator', isInitiator);
            // if (isInitiator) {
            //   doCall(receiver);
            // }
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
          console.log('Remote stream added.');
          // remoteVideo.src = window.URL.createObjectURL(event.stream);
          // remoteStream = event.stream;
        }

        function handleRemoteStreamRemoved(event) {
          console.log('Remote stream removed. Event: ', event);
        }

        function handleRemoteHangup() {
          console.log('Session terminated.');
          // remoteStream.getVideoTracks().forEach(function(videoTrack) {
          //   videoTrack.stop();
          // });
          // remoteVideo.src = null;
          stop();
          // isInitiator = false;
        }

        this.hangup = function() {
          if (isStarted) {
            stop();
            sendMessage('bye');
          }
        };

        function stop() {
          isStarted = false;
          // isAudioMuted = false;
          // isVideoMuted = false;
          pc.close();
          pc = null;
        }

        this.destroy = function() {
          signaling.destroy();
        };

      }

      var isInitiator = true;

      var localSignaling = BroadcastSignaling({
        sessionid: scope.sessionId,
        channelid: scope.channel.id,
        uid: scope.uid
      });
      // var remoteSignaling = Signaling({
      //   callid: scope.call.id,
      //   uid: (scope.call.caller === scope.uid) ? scope.call.callee : scope.call.caller
      // });

      var viewers = {};
      angular.forEach(scope.friends, function(friend) {
        viewers[friend.uid] = new Viewer(friend.uid);
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
      // var remoteVideo = iElement[0].querySelector('#remoteVideo');
      
      var localStream;
      // var remoteStream;

      var constraints = {
        audio: false,
        video: true
      };

      function gotStream(stream) {
        console.log('Adding local stream.');
        // localVideo.src = window.URL.createObjectURL(stream);
        localStream = stream;
        // maybeStart();
      }

      function start() {
        console.log('Requesting local stream');
        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream)
        .catch(function(e) {
          console.error(e);
          alert('getUserMedia() error: ' + e.name);
        });
      }
      // function start(event, initiator) {
      //   isInitiator = (initiator === true);
      //   isChannelReady = !isInitiator;
      //   console.log('Requesting local stream');
      //   // startButton.disabled = true;
      //   navigator.mediaDevices.getUserMedia(constraints)
      //   .then(gotStream)
      //   .catch(function(e) {
      //     console.error(e);
      //     alert('getUserMedia() error: ' + e.name);
      //   });
      // }

      function hangup() {
        console.log('Hanging up.');
        localStream.getVideoTracks().forEach(function(videoTrack) {
          videoTrack.stop();
        });
        // localVideo.src = null;
        angular.forEach(viewers, function(viewer) {
          viewer.hangup();
        });
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

      // scope.$on('join-broadcast-channel', start);
      // // scope.$on('start-peer-call', call);
      scope.$on('hangup-broadcast-owner', hangup);

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
        channel: '=',
        friends: '=',
        sessionId: '@',
        uid: '='
      },
      controller: 'BroadcastOwnerVideoCtrl',
      link: link
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope'];

  /* @ngInject */
  function ControllerFunction($scope) {

    // $scope.$on('call-peer', function() {
    //   console.log('call-peer message received...');
    // });

  }

})();
