(function() {
  'use strict';

  var shareSignalingFactory = function($rootScope, firebaseDataService) {

    var _SHARE_MESSAGE_ = '_SHARE_MESSAGE_';

    function ShareSignaling(options) {
      if (!(this instanceof ShareSignaling)) {
        var obj = Object.create(ShareSignaling.prototype);
        return ShareSignaling.apply(obj, arguments);
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

      this.channel = firebaseDataService.shareSignaling.child(this.sessionId).child(this.channelId).child(this.uid);

      return this;
    }

    ShareSignaling.prototype.onMessage = function($scope, handler) {
      $scope.$on(_SHARE_MESSAGE_, function(event, args) {
        handler(args.data, args.sessionId, args.channelId, args.uid);
      });
      var self = this;
      self.channel.on('child_added', function(snapshot, prevChildKey) {
        $rootScope.$broadcast(_SHARE_MESSAGE_, {
          sessionId: self.sessionId,
          channelId: self.channelId,
          uid: self.uid,
          data: snapshot.val()
        });
        snapshot.ref.remove();
      });
    };

    ShareSignaling.prototype.destroy = function() {
      this.channel.off();
    };

    // Returns Promise
    ShareSignaling.prototype.writeMessage = function(message, sender) {
      return this.channel.push({
        signal: 'message',
        sender: sender,
        value: message
      });
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (ShareSignaling);

  };

  shareSignalingFactory.$inject = ['$rootScope', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('ShareSignaling', shareSignalingFactory);

})();
