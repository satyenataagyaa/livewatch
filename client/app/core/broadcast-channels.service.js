(function() {
  'use strict';

  var broadcastChannelsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _BROADCAST_CHANNEL_ADDED_ = '_BROADCAST_CHANNEL_ADDED_';
    var _BROADCAST_CHANNEL_REMOVED_ = '_BROADCAST_CHANNEL_REMOVED_';
    var _BROADCAST_CHANNEL_CHANGED_ = '_BROADCAST_CHANNEL_CHANGED_';

    function BroadcastChannels(options) {
      if (!(this instanceof BroadcastChannels)) {
        var obj = Object.create(BroadcastChannels.prototype);
        return BroadcastChannels.apply(obj, arguments);
      }

      options = options || {};
      var broadcastOwnerId = options.broadcastownerid;
      if (!broadcastOwnerId) {
        throw new Error('broadcast-owner-id missing');
      }
      var broadcastSessionId = options.broadcastsessionid;
      if (!broadcastSessionId) {
        throw new Error('broadcast-session-id missing');
      }

      Collection.apply(this);

      var self = this;

      this.broadcastChannels = firebaseDataService.broadcastChannels.child(broadcastOwnerId).child(broadcastSessionId);

      this.broadcastChannels.on('child_added', function(snapshot, prevChildKey) {
        var broadcastChannel = snapshot.val();
        broadcastChannel.id = snapshot.key;
        self.add(broadcastChannel);
        $rootScope.$broadcast(_BROADCAST_CHANNEL_ADDED_, {
          data: {
            broadcastChannel: broadcastChannel,
            index: self.length - 1
          }
        });
      });
      this.broadcastChannels.on('child_removed', function(prevSnapshot) {
        var broadcastChannel = prevSnapshot.val();
        broadcastChannel.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === broadcastChannel.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_BROADCAST_CHANNEL_REMOVED_, {
            data: {
              broadcastChannel: broadcastChannel,
              index: index
            }
          });
        }
      });
      this.broadcastChannels.on('child_changed', function(snapshot, prevChildKey) {
        var broadcastChannel = snapshot.val();
        broadcastChannel.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === broadcastChannel.id;
        });
        if (index > -1) {
          var oldBroadcastSession = self[index];
          self[index] = broadcastChannel;
          $rootScope.$broadcast(_BROADCAST_CHANNEL_CHANGED_, {
            data: {
              newBroadcastSession: broadcastChannel,
              oldBroadcastSession: oldBroadcastSession,
              index: index
            }
          });
        }
      });
      this.broadcastChannels.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialBroadcastChannels)) {
          self.initialBroadcastChannels = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialBroadcastChannels);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    BroadcastChannels.prototype = Object.create(Collection.prototype);
    BroadcastChannels.prototype.constructor = BroadcastChannels;

    BroadcastChannels.prototype.onBroadcastChannelAdded = function($scope, handler) {
      $scope.$on(_BROADCAST_CHANNEL_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastChannels.prototype.onBroadcastChannelRemoved = function($scope, handler) {
      $scope.$on(_BROADCAST_CHANNEL_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastChannels.prototype.onBroadcastChannelChanged = function($scope, handler) {
      $scope.$on(_BROADCAST_CHANNEL_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastChannels.prototype.loaded = function() {
      if (angular.isDefined(this.initialBroadcastChannels)) {
        return $q.when(this.initialBroadcastChannels);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    BroadcastChannels.prototype.destroy = function() {
      this.broadcastChannels.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (BroadcastChannels);

  };

  broadcastChannelsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('BroadcastChannels', broadcastChannelsFactory);

})();
