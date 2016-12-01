(function() {
  'use strict';

  var shareSessionsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _SHARE_SESSION_ADDED_ = '_SHARE_SESSION_ADDED_';
    var _SHARE_SESSION_REMOVED_ = '_SHARE_SESSION_REMOVED_';
    var _SHARE_SESSION_CHANGED_ = '_SHARE_SESSION_CHANGED_';

    function ShareSessions(options) {
      if (!(this instanceof ShareSessions)) {
        var obj = Object.create(ShareSessions.prototype);
        return ShareSessions.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }

      Collection.apply(this);

      var self = this;

      this.shareSessions = firebaseDataService.shareSessions.child(uid);

      this.shareSessions.on('child_added', function(snapshot, prevChildKey) {
        var shareSession = snapshot.val();
        shareSession.id = snapshot.key;
        self.add(shareSession);
        $rootScope.$broadcast(_SHARE_SESSION_ADDED_, {
          data: {
            shareSession: shareSession,
            index: self.length - 1
          }
        });
      });
      this.shareSessions.on('child_removed', function(prevSnapshot) {
        var shareSession = prevSnapshot.val();
        shareSession.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === shareSession.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_SHARE_SESSION_REMOVED_, {
            data: {
              shareSession: shareSession,
              index: index
            }
          });
        }
      });
      this.shareSessions.on('child_changed', function(snapshot, prevChildKey) {
        var shareSession = snapshot.val();
        shareSession.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === shareSession.id;
        });
        if (index > -1) {
          var oldShareSession = self[index];
          self[index] = shareSession;
          $rootScope.$broadcast(_SHARE_SESSION_CHANGED_, {
            data: {
              newShareSession: shareSession,
              oldShareSession: oldShareSession,
              index: index
            }
          });
        }
      });
      this.shareSessions.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialShareSessions)) {
          self.initialShareSessions = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialShareSessions);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    ShareSessions.prototype = Object.create(Collection.prototype);
    ShareSessions.prototype.constructor = ShareSessions;

    ShareSessions.prototype.onShareSessionAdded = function($scope, handler) {
      $scope.$on(_SHARE_SESSION_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareSessions.prototype.onShareSessionRemoved = function($scope, handler) {
      $scope.$on(_SHARE_SESSION_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareSessions.prototype.onShareSessionChanged = function($scope, handler) {
      $scope.$on(_SHARE_SESSION_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareSessions.prototype.loaded = function() {
      if (angular.isDefined(this.initialShareSessions)) {
        return $q.when(this.initialShareSessions);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    ShareSessions.prototype.destroy = function() {
      this.shareSessions.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (ShareSessions);

  };

  shareSessionsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('ShareSessions', shareSessionsFactory);

})();
