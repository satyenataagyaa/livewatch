(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('activeCall', directiveFunction)
    .controller('ActiveCallCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/dashboard/call/active-call.html',
      scope: {
        call: '=',
        uid: '=',
        onClose: '&'
      },
      controller: 'ActiveCallCtrl'
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope', '$timeout', '$interval', '$q', 'firebaseDataService', 'Call', 'User', 'UserFriends', 'ShareSessions', 'ShareChannels'];

  /* @ngInject */
  function ControllerFunction($scope, $timeout, $interval, $q, firebaseDataService, Call, User, UserFriends, ShareSessions, ShareChannels) {

    ////////////////////////////////////

    $scope.determinateValue = 10;
    $scope.determinateValue2 = 10;

    var destroyInterval = $interval(function() {
      $scope.determinateValue += 1;
      $scope.determinateValue2 += 2;
      if ($scope.determinateValue > 100) $scope.determinateValue = 10;
      if ($scope.determinateValue2 > 100) $scope.determinateValue2 = 10;
    }, 100, 0, true);

    // $scope.$on('$destroy', function() {
    //   $interval.cancel(destroyInterval);
    // });

    ////////////////////////////////////

    var CALL_STATE_INIT = 0,
        CALL_STATE_OFFERED = 1,
        CALL_STATE_ANSWERED = 2,
        CALL_STATE_DISCONNECTED = 3;

    var SHARE_STATE_INIT = 0,
        SHARE_STATE_ACTIVE = 1;

    var BROADCAST_STATE_INIT = 0,
        BROADCAST_STATE_ACTIVE = 1;

    $scope.callState = CALL_STATE_INIT;
    $scope.shareState = SHARE_STATE_INIT;
    $scope.broadcastState = BROADCAST_STATE_INIT;

    var storageUser = User($scope.uid);
    var storageCall = Call({
      uid: $scope.uid,
      callid: $scope.call.id
    });
    var storageUserFriends = UserFriends({
      uid: $scope.uid
    });
    var storageShareSessions = ShareSessions({
      uid: $scope.uid
    });
    var storageShareChannels = null;
    // var storageBroadcastSessions = BroadcastSessions({
    //   uid: $scope.uid
    // });
    // var storageBroadcastChannels = null;

    $scope.isUserCaller = $scope.call.caller === $scope.uid;

    $scope.userFriends = [];
    $scope.shareVideoChannel = null;
    $scope.shareScreenChannel = null;
    $scope.broadcastChannels = [];

    $scope.isUserOfferer = isUserOfferer;
    $scope.callConnected = callConnected;
    $scope.callDisconnected = callDisconnected;
    $scope.cancel = cancel;
    $scope.startCall = startCall;
    $scope.snooze = snooze;
    $scope.answer = answer;
    $scope.hangup = hangup;
    // $scope.startBroadcast = startBroadcast;
    // $scope.stopBroadcast = stopBroadcast;

    $scope.$on('$destroy', function() {
      storageCall.destroy();
      storageUserFriends.destroy();
      storageShareSessions.destroy();
      if (storageShareChannels != null) {
        storageShareChannels.destroy();
      }
      // storageBroadcastSessions.destroy();
      // if (storageBroadcastChannels != null) {
      //   storageBroadcastChannels.destroy();
      // }
      $interval.cancel(destroyInterval);
    });

    storageCall.loaded()
    .then(function(call) {
      $scope.offerer = call.offerer;
      $scope.answerer = call.answerer;
    });

    storageCall.onOffererUpdated($scope, function(data) {
      $timeout(function() {
        $scope.offerer = data.offerer;
        if ($scope.callState === CALL_STATE_INIT && $scope.offerer) {
          $scope.callState = CALL_STATE_OFFERED;
        } else if ($scope.callState === CALL_STATE_ANSWERED && !$scope.offerer) {
          $scope.callState = CALL_STATE_DISCONNECTED;
        }
      });
    });
    storageCall.onAnswererUpdated($scope, function(data) {
      $timeout(function() {
        $scope.answerer = data.answerer;
        if ($scope.callState === CALL_STATE_OFFERED && $scope.answerer) {
          $scope.callState = CALL_STATE_ANSWERED;
        } else if ($scope.callState === CALL_STATE_ANSWERED && !$scope.answerer) {
          $scope.callState = CALL_STATE_DISCONNECTED;
        }
      });
    });

    storageUser.loaded()
    .then(function(user) {
      $scope.userPrivileges = user.privileges || {};
    });

    storageUserFriends.onUserFriendAdded($scope, function(data) {
      $scope.userFriends.push(data.userFriend);
    });
    storageUserFriends.onUserFriendRemoved($scope, function(data) {
      $scope.userFriends = $scope.userFriends.filter(function(element) {
        return element.uid !== data.userFriend.uid
      });
    });

    storageShareSessions.onShareSessionAdded($scope, function(data) {
      // $timeout(function() {
        var shareSession = data.shareSession;
        // We only care about the active call
        if (shareSession.callId === $scope.call.id) {
          $scope.shareSession = shareSession;
          if (shareSession.owner === $scope.uid) {
            storageShareChannels = ShareChannels({
              shareownerid: $scope.uid,
              sharesessionid: shareSession.id
            });
            storageShareChannels.onShareChannelAdded($scope, function(data) {
              $timeout(function() {
                var shareChannel = data.shareChannel;
                if (shareChannel.type === 'video') {
                  $scope.shareVideoChannel = shareChannel;
                } else if (shareChannel.type === 'screen') {
                  $scope.shareScreenChannel = shareChannel;
                }
                if ($scope.shareVideoChannel && $scope.shareScreenChannel) {
                  if ($scope.shareState === SHARE_STATE_INIT) {
                    $scope.shareState = SHARE_STATE_ACTIVE;
                  }
                }
              });
            });
            createShareChannels();
          }
        }
      // });
    });

    storageShareSessions.onShareSessionRemoved($scope, function(data) {
      $timeout(function() {
        var shareSession = data.shareSession;
        // We only care about the active call
        if (shareSession.callId === $scope.call.id) {
          if (shareSession.owner === $scope.uid) {
            $scope.shareState = SHARE_STATE_INIT;
            storageShareChannels.destroy();
            storageShareChannels = null;
          }
          delete $scope.shareSession;
        }
      });
    });

    // storageBroadcastSessions.onBroadcastSessionAdded($scope, function(data) {
    //   $timeout(function() {
    //     var broadcastSession = data.broadcastSession;
    //     // We only care about the active call
    //     if (broadcastSession.callId === $scope.call.id) {
    //       $scope.broadcastSession = broadcastSession;
    //       if ($scope.broadcastState === BROADCAST_STATE_INIT) {
    //         $scope.broadcastState = BROADCAST_STATE_ACTIVE;
    //       }
    //       if (isUserBroadcaster()) {
    //         storageBroadcastChannels = BroadcastChannels({
    //           broadcastownerid: $scope.uid,
    //           broadcastsessionid: broadcastSession.id
    //         });
    //         storageBroadcastChannels.onBroadcastChannelAdded($scope, function(data) {
    //           $timeout(function() {
    //             var broadcastChannel = angular.copy(data.broadcastChannel);
    //             $scope.broadcastChannels.push(broadcastChannel);
    //           });
    //         });
    //         createBroadcastChannels();
    //       }
    //     }
    //   });
    // });

    // storageBroadcastSessions.onBroadcastSessionRemoved($scope, function(data) {
    //   $timeout(function() {
    //     var broadcastSession = data.broadcastSession;
    //     // We only care about the active call
    //     if (broadcastSession.callId === $scope.call.id) {
    //       if (isUserBroadcaster()) {
    //         // hangupBroadcastOwner();
    //         $scope.broadcastState = BROADCAST_STATE_INIT;
    //         storageBroadcastChannels.destroy();
    //         storageBroadcastChannels = null;
    //       }
    //       delete $scope.broadcastSession;
    //     }
    //   });
    // });

    function joinPeerCall() {
      $scope.$broadcast('join-peer-call', isUserOfferer());
    }

    function hangupPeerCall() {
      $scope.$broadcast('hangup-peer-call');
    }

    function isUserOfferer() {
      return ($scope.offerer === $scope.uid);
    }

    function callConnected(streams) {
      console.log('Call connected:', streams);
      $scope.localVideoStream = streams.local;
    }

    function callDisconnected() {
      console.log('Call disconnected.');
    }

    function cancel() {
      $scope.onClose();
    }

    function startCall() {
      storageCall.registerOffer()
      .then(function() {
        joinPeerCall();
      });
    }

    function snooze() {
      if (isUserOfferer()) {
        storageCall.unregisterOffer();
      } else {
        if ($scope.answerer) {
          storageCall.unregisterAnswer();
        }
      }
      $scope.onClose();
    }

    function answer() {
      storageCall.registerAnswer()
      .then(function() {
        joinPeerCall();
        if ($scope.userPrivileges.share) {
          startShare();
        }
      });
    }

    function hangup() {
      var promise = $scope.shareState === SHARE_STATE_ACTIVE ? stopShare() : $q.when();
      promise.then(function() {
        return isUserOfferer() ? storageCall.unregisterOffer() : storageCall.unregisterAnswer();
      }).then(function() {
        hangupPeerCall();
        $scope.onClose({
          complete: true
        });
      });
    }

    function hangupShareOwner() {
      $scope.$broadcast('hangup-share-owner');
    }

    function startShare() {
      return firebaseDataService.createShareSession({
        callid: $scope.call.id,
        owner: $scope.uid,
        friends: $scope.userFriends.map(function(uf) {
          return uf.uid;
        })
      });
    }

    function stopShare() {
      hangupShareOwner();
      return deleteShareChannels()
      .then(function() {
        return firebaseDataService.deleteShareSession({
          sharesessionid: $scope.shareSession.id,
          owner: $scope.uid,
          friends: $scope.userFriends.map(function(uf) {
            return uf.uid;
          })
        });
      });
    }

    function createShareChannels() {
      return firebaseDataService.createShareChannel({
        uid: $scope.uid,
        sharesessionid: $scope.shareSession.id,
        type: 'video',
        owner: $scope.uid
      }).then(function() {
        return firebaseDataService.createShareChannel({
          uid: $scope.uid,
          sharesessionid: $scope.shareSession.id,
          type: 'screen',
          owner: $scope.uid
        });
      });
    }

    function deleteShareChannels() {
      return firebaseDataService.deleteShareChannel({
        owner: $scope.uid,
        sharesessionid: $scope.shareSession.id,
        sharechannelid: $scope.shareVideoChannel.id
      }).then(function() {
        return firebaseDataService.deleteShareChannel({
          owner: $scope.uid,
          sharesessionid: $scope.shareSession.id,
          sharechannelid: $scope.shareScreenChannel.id
        });
      });
    }

    // function hangupBroadcastOwner() {
    //   $scope.$broadcast('hangup-broadcast-owner');
    // }

    // function isUserBroadcaster() {
    //   return ($scope.broadcastSession && $scope.broadcastSession.broadcaster === $scope.uid);
    // }

    // function startBroadcast() {
    //   return firebaseDataService.createBroadcastSession({
    //     callid: $scope.call.id,
    //     broadcaster: $scope.uid,
    //     friends: $scope.userFriends.map(function(uf) {
    //       return uf.uid;
    //     })
    //   });
    // }

    // function stopBroadcast() {
    //   hangupBroadcastOwner();
    //   return deleteBroadcastChannels()
    //   .then(function() {
    //     return firebaseDataService.deleteBroadcastSession({
    //       broadcastsessionid: $scope.broadcastSession.id,
    //       broadcaster: $scope.uid,
    //       friends: $scope.userFriends.map(function(uf) {
    //         return uf.uid;
    //       })
    //     });
    //   });
    // }

    // function createBroadcastChannels() {
    //   return firebaseDataService.createBroadcastChannel({
    //     uid: $scope.uid,
    //     broadcastsessionid: $scope.broadcastSession.id,
    //     type: 'video',
    //     broadcaster: $scope.uid
    //   }).then(function() {
    //     return firebaseDataService.createBroadcastChannel({
    //       uid: $scope.uid,
    //       broadcastsessionid: $scope.broadcastSession.id,
    //       type: 'screen',
    //       broadcaster: $scope.uid
    //     });
    //   });
    // }

    // function deleteBroadcastChannels() {
    //   return firebaseDataService.deleteBroadcastChannel({
    //     broadcaster: $scope.uid,
    //     broadcastsessionid: $scope.broadcastSession.id,
    //     broadcastchannelid: $scope.broadcastChannels[0].id
    //   }).then(function() {
    //     return firebaseDataService.deleteBroadcastChannel({
    //       broadcaster: $scope.uid,
    //       broadcastsessionid: $scope.broadcastSession.id,
    //       broadcastchannelid: $scope.broadcastChannels[1].id
    //     });
    //   });
    // }

  }

})();