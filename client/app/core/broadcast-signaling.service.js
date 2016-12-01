(function() {
  'use strict';

  var broadcastSignalingFactory = function($rootScope, firebaseDataService) {

    var _BROADCAST_MESSAGE_ = '_BROADCAST_MESSAGE_';

    function BroadcastSignaling(options) {
      if (!(this instanceof BroadcastSignaling)) {
        var obj = Object.create(BroadcastSignaling.prototype);
        return BroadcastSignaling.apply(obj, arguments);
      }

      options = options || {};
      this.sessionId = options.sessionid;
      if (!this.sessionId) {
        throw new Error('session-id missing');
      }
      this.channelId = options.channelid;
      if (!this.channelId) {
        throw new Error('channel-id missing');
      }
      this.uid = options.uid;
      if (!this.uid) {
        throw new Error('uid missing');
      }

      this.channel = firebaseDataService.broadcastSignaling.child(this.sessionId).child(this.channelId).child(this.uid);

      return this;
    }

    BroadcastSignaling.prototype.onMessage = function($scope, handler) {
      $scope.$on(_BROADCAST_MESSAGE_, function(event, args) {
        handler(args.data, args.sessionId, args.channelId, args.uid);
      });
      var self = this;
      self.channel.on('child_added', function(snapshot, prevChildKey) {
        $rootScope.$broadcast(_BROADCAST_MESSAGE_, {
          sessionId: self.sessionId,
          channelId: self.channelId,
          uid: self.uid,
          data: snapshot.val()
        });
        snapshot.ref.remove();
      });
    };

    BroadcastSignaling.prototype.destroy = function() {
      this.channel.off();
    };

    // Returns Promise
    BroadcastSignaling.prototype.writeMessage = function(message, sender) {
      return this.channel.push({
        signal: 'message',
        sender: sender,
        value: message
      });
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (BroadcastSignaling);

  };

  broadcastSignalingFactory.$inject = ['$rootScope', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('BroadcastSignaling', broadcastSignalingFactory);

})();
