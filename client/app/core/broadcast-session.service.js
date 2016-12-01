(function() {
  'use strict';

  var broadcastSessionFactory = function(firebaseDataService) {

    var _UPDATED_ = '_UPDATED_';
    var _DELETED_ = '_DELETED_';

    function BroadcastSession(options) {
      if (!(this instanceof BroadcastSession)) {
        var obj = Object.create(BroadcastSession.prototype);
        return BroadcastSession.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var broadcastSessionId = options.broadcastsessionid;
      if (!broadcastSessionId) {
        throw new Error('broadcast-session-id missing');
      }

      var self = this;

      this.broadcastSession = firebaseDataService.broadcastSessions.child(uid).child(broadcastSessionId);

      this.broadcastSession.on('value', function(snapshot) {
        self.value = snapshot.val();
        if (self.value != null) {
          self.value.id = snapshot.key;
          $rootScope.$broadcast(_UPDATED_, {
            data: {
              broadcastSession: self.value
            }
          });
        } else {
          $rootScope.$broadcast(_DELETED_, {
            data: {
              broadcastSession: undefined
            }
          });
        }
      });

      return this;
    }

    BroadcastSession.prototype.onUpdated = function($scope, handler) {
      $scope.$on(_UPDATED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastSession.prototype.onDeleted = function($scope, handler) {
      $scope.$on(_DELETED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastSession.prototype.destroy = function() {
      this.broadcastSession.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (BroadcastSession);

  };

  broadcastSessionFactory.$inject = ['firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('BroadcastSession', broadcastSessionFactory);

})();
