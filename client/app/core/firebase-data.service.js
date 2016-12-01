(function() {
  'use strict';

  angular
    .module('livewatchApp.core')
    .factory('firebaseDataService', firebaseDataService);

  firebaseDataService.$inject = [];

  function firebaseDataService() {
    var root = firebase.database().ref();

    var topNodes = {
      USERS: 'users',
      USER_FRIENDS: 'userFriends',
      CALLS: 'calls',
      CALLER_MAPPINGS: 'caller-mappings',
      SIGNALING: 'signaling',
      SHARE_SESSIONS: 'share-sessions',
      SHARE_CHANNELS: 'share-channels',
      SHARE_SIGNALING: 'share-signaling',
      SHARE_PADS: 'share-pads',
      // BROADCAST_SESSIONS: 'broadcastSessions',
      // BROADCAST_CHANNELS: 'broadcastChannels',
      // BROADCAST_SIGNALING: 'broadcastSignaling',
      // BROADCAST_PADS: 'broadcastPads'
      RECORDINGS: 'recordings',
      USER_RECORDING_CALLS: 'user-recording-calls'
    };

    var service = {
      root: root,
      usersPath: topNodes.USERS,
      users: root.child(topNodes.USERS),
      userFriendsPath: topNodes.USER_FRIENDS,
      userFriends: root.child(topNodes.USER_FRIENDS),
      callsPath: topNodes.CALLS,
      calls: root.child(topNodes.CALLS),
      callerMappingsPath: topNodes.CALLER_MAPPINGS,
      callerMappings: root.child(topNodes.CALLER_MAPPINGS),
      signalingPath: topNodes.SIGNALING,
      signaling: root.child(topNodes.SIGNALING),
      shareSessionsPath: topNodes.SHARE_SESSIONS,
      shareSessions: root.child(topNodes.SHARE_SESSIONS),
      shareChannelsPath: topNodes.SHARE_CHANNELS,
      shareChannels: root.child(topNodes.SHARE_CHANNELS),
      shareSignalingPath: topNodes.SHARE_SIGNALING,
      shareSignaling: root.child(topNodes.SHARE_SIGNALING),
      sharePadsPath: topNodes.SHARE_PADS,
      sharePads: root.child(topNodes.SHARE_PADS),
      // broadcastSessionsPath: topNodes.BROADCAST_SESSIONS,
      // broadcastSessions: root.child(topNodes.BROADCAST_SESSIONS),
      // broadcastChannelsPath: topNodes.BROADCAST_CHANNELS,
      // broadcastChannels: root.child(topNodes.BROADCAST_CHANNELS),
      // broadcastSignalingPath: topNodes.BROADCAST_SIGNALING,
      // broadcastSignaling: root.child(topNodes.BROADCAST_SIGNALING),
      // broadcastPadsPath: topNodes.BROADCAST_PADS,
      // broadcastPads: root.child(topNodes.BROADCAST_PADS),
      recordingsPath: topNodes.RECORDINGS,
      recordings: root.child(topNodes.RECORDINGS),
      userRecordingCallsPath: topNodes.USER_RECORDING_CALLS,
      userRecordingCalls: root.child(topNodes.USER_RECORDING_CALLS),

      createShareSession: createShareSession,
      deleteShareSession: deleteShareSession,
      createShareChannel: createShareChannel,
      deleteShareChannel: deleteShareChannel
      // createBroadcastSession: createBroadcastSession,
      // deleteBroadcastSession: deleteBroadcastSession,
      // createBroadcastChannel: createBroadcastChannel,
      // deleteBroadcastChannel: deleteBroadcastChannel
    };

    function ShareSessionModel(callId, owner) {
      this.callId = callId;
      this.owner = owner;
    }

    // Returns Promise
    function createShareSession(options) {
      options = options || {};
      var callId = options.callid;
      if (!callId) {
        throw new Error("Missing call-id");
      }
      var owner = options.owner;
      if (!owner) {
        throw new Error("Missing owner");
      }
      var friends = options.friends || [];
      if (!angular.isArray(friends)) {
        throw new Error("friends must be an array");
      }

      var shareSessions = service.shareSessions.child(owner);
      var shareSessionId = shareSessions.push().key;
      var shareSession = new ShareSessionModel(callId, owner);
      var userData = {};
      userData[service.shareSessionsPath + '/' + owner + '/' + shareSessionId] = shareSession;
      angular.forEach(friends, function(friend) {
        userData[service.shareSessionsPath + '/' + friend + '/' + shareSessionId] = shareSession;
      });
      return root.update(userData);
    }

    // Returns Promise
    function deleteShareSession(options) {
      options = options || {};
      var shareSessionId = options.sharesessionid;
      if (!shareSessionId) {
        throw new Error("Missing share-session-id");
      }
      var owner = options.owner;
      if (!owner) {
        throw new Error("Missing owner");
      }
      var friends = options.friends || [];
      if (!angular.isArray(friends)) {
        throw new Error("friends must be an array");
      }

      var userData = {};
      userData[service.shareSessionsPath + '/' + owner + '/' + shareSessionId] = null;
      angular.forEach(friends, function(friend) {
        userData[service.shareSessionsPath + '/' + friend + '/' + shareSessionId] = null;
      });
      return root.update(userData);
    }

    function ShareChannelModel(type, owner) {
      this.type = type;
      this.owner = owner;
    }

    // Returns Promise
    function createShareChannel(options) {
      options = options || {};
      var uId = options.uid;
      if (!uId) {
        throw new Error("Missing user-id");
      }
      var shareSessionId = options.sharesessionid;
      if (!shareSessionId) {
        throw new Error("Missing share-session-id");
      }
      var type = options.type;
      if (!type) {
        throw new Error("Missing type");
      }
      var owner = options.owner;
      if (!owner) {
        throw new Error("Missing owner");
      }

      var shareChannels = service.shareChannels.child(uId).child(shareSessionId);
      var shareChannelModel = new ShareChannelModel(type, owner);
      return shareChannels.push(shareChannelModel);
    }

    // Returns Promise
    function deleteShareChannel(options) {
      options = options || {};
      var owner = options.owner;
      if (!owner) {
        throw new Error("Missing owner");
      }
      var shareSessionId = options.sharesessionid;
      if (!shareSessionId) {
        throw new Error("Missing share-session-id");
      }
      var shareChannelId = options.sharechannelid;
      if (!shareChannelId) {
        throw new Error("Missing share-channel-id");
      }

      return service.shareChannels.child(owner).child(shareSessionId).child(shareChannelId).remove();
    }

    // function BroadcastSessionModel(callId, broadcaster) {
    //   this.callId = callId;
    //   this.broadcaster = broadcaster;
    // }

    // // Returns Promise
    // function createBroadcastSession(options) {
    //   options = options || {};
    //   var callId = options.callid;
    //   if (!callId) {
    //     throw new Error("Missing call-id");
    //   }
    //   var broadcaster = options.broadcaster;
    //   if (!broadcaster) {
    //     throw new Error("Missing broadcaster");
    //   }
    //   var friends = options.friends || [];
    //   if (!angular.isArray(friends)) {
    //     throw new Error("friends must be an array");
    //   }

    //   var broadcastSessions = service.broadcastSessions.child(broadcaster);
    //   var broadcastSessionId = broadcastSessions.push().key;
    //   var broadcastSessionModel = new BroadcastSessionModel(callId, broadcaster);
    //   var userData = {};
    //   userData[service.broadcastSessionsPath + '/' + broadcaster + '/' + broadcastSessionId] = broadcastSessionModel;
    //   angular.forEach(friends, function(friend) {
    //     userData[service.broadcastSessionsPath + '/' + friend + '/' + broadcastSessionId] = broadcastSessionModel;
    //   });
    //   return root.update(userData);
    // }

    // // Returns Promise
    // function deleteBroadcastSession(options) {
    //   options = options || {};
    //   var broadcastSessionId = options.broadcastsessionid;
    //   if (!broadcastSessionId) {
    //     throw new Error("Missing broadcast-session-id");
    //   }
    //   var broadcaster = options.broadcaster;
    //   if (!broadcaster) {
    //     throw new Error("Missing broadcaster");
    //   }
    //   var friends = options.friends || [];
    //   if (!angular.isArray(friends)) {
    //     throw new Error("friends must be an array");
    //   }

    //   var userData = {};
    //   userData[service.broadcastSessionsPath + '/' + broadcaster + '/' + broadcastSessionId] = null;
    //   angular.forEach(friends, function(friend) {
    //     userData[service.broadcastSessionsPath + '/' + friend + '/' + broadcastSessionId] = null;
    //   });
    //   // userData[service.broadcastChannelsPath + '/' + broadcaster + '/' + broadcastSessionId] = null;
    //   return root.update(userData);
    // }

    // function BroadcastChannelModel(type, broadcaster) {
    //   this.type = type;
    //   this.broadcaster = broadcaster;
    // }

    // // Returns Promise
    // function createBroadcastChannel(options) {
    //   options = options || {};
    //   var uId = options.uid;
    //   if (!uId) {
    //     throw new Error("Missing user-id");
    //   }
    //   var broadcastSessionId = options.broadcastsessionid;
    //   if (!broadcastSessionId) {
    //     throw new Error("Missing broadcast-session-id");
    //   }
    //   var type = options.type;
    //   if (!type) {
    //     throw new Error("Missing type");
    //   }
    //   var broadcaster = options.broadcaster;
    //   if (!broadcaster) {
    //     throw new Error("Missing broadcaster");
    //   }

    //   var broadcastChannels = service.broadcastChannels.child(uId).child(broadcastSessionId);
    //   var broadcastChannelModel = new BroadcastChannelModel(type, broadcaster);
    //   return broadcastChannels.push(broadcastChannelModel);
    // }

    // // Returns Promise
    // function deleteBroadcastChannel(options) {
    //   options = options || {};
    //   var broadcaster = options.broadcaster;
    //   if (!broadcaster) {
    //     throw new Error("Missing broadcaster");
    //   }
    //   var broadcastSessionId = options.broadcastsessionid;
    //   if (!broadcastSessionId) {
    //     throw new Error("Missing broadcast-session-id");
    //   }
    //   var broadcastChannelId = options.broadcastchannelid;
    //   if (!broadcastChannelId) {
    //     throw new Error("Missing broadcast-channel-id");
    //   }

    //   return service.broadcastChannels.child(broadcaster).child(broadcastSessionId).child(broadcastChannelId).remove();
    // }

    return service;
  }

})();
