(function() {
  'use strict';

  var broadcastSessionsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _BROADCAST_SESSION_ADDED_ = '_BROADCAST_SESSION_ADDED_';
    var _BROADCAST_SESSION_REMOVED_ = '_BROADCAST_SESSION_REMOVED_';
    var _BROADCAST_SESSION_CHANGED_ = '_BROADCAST_SESSION_CHANGED_';

    function BroadcastSessions(options) {
      if (!(this instanceof BroadcastSessions)) {
        var obj = Object.create(BroadcastSessions.prototype);
        return BroadcastSessions.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }

      Collection.apply(this);

      var self = this;

      this.broadcastSessions = firebaseDataService.broadcastSessions.child(uid);

      this.broadcastSessions.on('child_added', function(snapshot, prevChildKey) {
        var broadcastSession = snapshot.val();
        broadcastSession.id = snapshot.key;
        self.add(broadcastSession);
        $rootScope.$broadcast(_BROADCAST_SESSION_ADDED_, {
          data: {
            broadcastSession: broadcastSession,
            index: self.length - 1
          }
        });
      });
      this.broadcastSessions.on('child_removed', function(prevSnapshot) {
        var broadcastSession = prevSnapshot.val();
        broadcastSession.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === broadcastSession.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_BROADCAST_SESSION_REMOVED_, {
            data: {
              broadcastSession: broadcastSession,
              index: index
            }
          });
        }
      });
      this.broadcastSessions.on('child_changed', function(snapshot, prevChildKey) {
        var broadcastSession = snapshot.val();
        broadcastSession.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === broadcastSession.id;
        });
        if (index > -1) {
          var oldBroadcastSession = self[index];
          self[index] = broadcastSession;
          $rootScope.$broadcast(_BROADCAST_SESSION_CHANGED_, {
            data: {
              newBroadcastSession: broadcastSession,
              oldBroadcastSession: oldBroadcastSession,
              index: index
            }
          });
        }
      });
      this.broadcastSessions.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialBroadcastSessions)) {
          self.initialBroadcastSessions = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialBroadcastSessions);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    BroadcastSessions.prototype = Object.create(Collection.prototype);
    BroadcastSessions.prototype.constructor = BroadcastSessions;

    BroadcastSessions.prototype.onBroadcastSessionAdded = function($scope, handler) {
      $scope.$on(_BROADCAST_SESSION_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastSessions.prototype.onBroadcastSessionRemoved = function($scope, handler) {
      $scope.$on(_BROADCAST_SESSION_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastSessions.prototype.onBroadcastSessionChanged = function($scope, handler) {
      $scope.$on(_BROADCAST_SESSION_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastSessions.prototype.loaded = function() {
      if (angular.isDefined(this.initialBroadcastSessions)) {
        return $q.when(this.initialBroadcastSessions);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    BroadcastSessions.prototype.destroy = function() {
      this.broadcastSessions.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (BroadcastSessions);

  };

  broadcastSessionsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('BroadcastSessions', broadcastSessionsFactory);

})();
