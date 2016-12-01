(function() {
  'use strict';

  var signalingFactory = function($rootScope, firebaseDataService) {

    var _MESSAGE_ = '_MESSAGE_';

    function Signaling(options) {
      if (!(this instanceof Signaling)) {
        var obj = Object.create(Signaling.prototype);
        return Signaling.apply(obj, arguments);
      }

      options = options || {};
      this.callId = options.callid;
      if (!this.callId) {
        throw new Error('call-id missing');
      }
      this.uid = options.uid;
      if (!this.uid) {
        throw new Error('uid missing');
      }

      this.channel = firebaseDataService.signaling.child(this.callId).child(this.uid);

      return this;
    }

    Signaling.prototype.onMessage = function($scope, handler) {
      $scope.$on(_MESSAGE_, function(event, args) {
        handler(args.data, args.callId, args.uid);
      });
      var self = this;
      this.channel.on('child_added', function(snapshot, prevChildKey) {
        $rootScope.$broadcast(_MESSAGE_, {
          callId: self.callId,
          uid: self.uid,
          data: snapshot.val()
        });
        snapshot.ref.remove();
      });
    };

    Signaling.prototype.destroy = function() {
      this.channel.off();
    };

    // Returns Promise
    Signaling.prototype.writeMessage = function(message) {
      return this.channel.push({
        signal: 'message',
        value: message
      });
    };

    // Signaling.prototype.writeReady = function() {
    //   return this.channel.push({
    //     signal: 'ready'
    //   });
    // };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Signaling);

  };

  signalingFactory.$inject = ['$rootScope', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('Signaling', signalingFactory);

})();
