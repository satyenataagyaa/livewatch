(function() {
  'use strict';

  var shareSessionFactory = function(firebaseDataService) {

    var _UPDATED_ = '_UPDATED_';
    var _DELETED_ = '_DELETED_';

    function ShareSession(options) {
      if (!(this instanceof ShareSession)) {
        var obj = Object.create(ShareSession.prototype);
        return ShareSession.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var shareSessionId = options.sharesessionid;
      if (!shareSessionId) {
        throw new Error('share-session-id missing');
      }

      var self = this;

      this.shareSession = firebaseDataService.shareSessions.child(uid).child(shareSessionId);

      this.shareSession.on('value', function(snapshot) {
        self.value = snapshot.val();
        if (self.value != null) {
          self.value.id = snapshot.key;
          $rootScope.$broadcast(_UPDATED_, {
            data: {
              shareSession: self.value
            }
          });
        } else {
          $rootScope.$broadcast(_DELETED_, {
            data: {
              shareSession: undefined
            }
          });
        }
      });

      return this;
    }

    ShareSession.prototype.onUpdated = function($scope, handler) {
      $scope.$on(_UPDATED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareSession.prototype.onDeleted = function($scope, handler) {
      $scope.$on(_DELETED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareSession.prototype.destroy = function() {
      this.shareSession.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (ShareSession);

  };

  shareSessionFactory.$inject = ['firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('ShareSession', shareSessionFactory);

})();
