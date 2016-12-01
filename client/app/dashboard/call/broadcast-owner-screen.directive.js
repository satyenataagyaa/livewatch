(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('broadcastOwnerScreen', directiveFunction)
    .controller('BroadcastOwnerScreenCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['screenShareService', 'BroadcastSignaling'];

  /* @ngInject */
  function directiveFunction(screenShareService, BroadcastSignaling) {

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

        // function doAnswer() {
        //   console.log('Sending answer to peer.');
        //   pc.createAnswer().then(
        //     setLocalAndSendMessage,
        //     onCreateSessionDescriptionError
        //   );
        // }

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

      // var isInitiator = true;
      var screenShareEnabled = screenShareService.enabled();

      var localSignaling = BroadcastSignaling({
        sessionid: scope.sessionId,
        channelid: scope.channel.id,
        uid: scope.uid
      });

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

      function getConstraints(streamId) {
        return {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: streamId,
              maxWidth: window.screen.width,
              maxHeight: window.screen.height
            }
          }
        };
      }

      function gotStream(stream) {
        // localVideo.src = window.URL.createObjectURL(stream);
        localStream = stream;
        // localVideo.play();
      }

      function startScreenStreamFrom(streamId) {
        navigator.webkitGetUserMedia(getConstraints(streamId), gotStream, function(err) {
          console.log('getUserMedia failed!: ' + err);
        });
      }

      var offScreenShareFn;

      function start() {
        if (!screenShareEnabled) {
          alert('Screen Sharing is not enabled!');
          return;
        }
        offScreenShareFn = screenShareService.onMessage(scope, function(data) {
          // user chose a stream
          if (data.type && (data.type === 'SS_DIALOG_SUCCESS')) {
            startScreenStreamFrom(data.streamId);
          }
          // user clicked on 'cancel' in choose media dialog
          if (data.type && (data.type === 'SS_DIALOG_CANCEL')) {
            console.log('User cancelled!');
          }
        });
        console.log('Requesting local stream');
        window.postMessage({ type: 'SS_UI_REQUEST', text: 'start', url: location.origin }, '*');
      }

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
      controller: 'BroadcastOwnerScreenCtrl',
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
