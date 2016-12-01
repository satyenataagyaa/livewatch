(function() {
  'use strict';

  var shareChannelsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _SHARE_CHANNEL_ADDED_ = '_SHARE_CHANNEL_ADDED_';
    var _SHARE_CHANNEL_REMOVED_ = '_SHARE_CHANNEL_REMOVED_';
    var _SHARE_CHANNEL_CHANGED_ = '_SHARE_CHANNEL_CHANGED_';

    function ShareChannels(options) {
      if (!(this instanceof ShareChannels)) {
        var obj = Object.create(ShareChannels.prototype);
        return ShareChannels.apply(obj, arguments);
      }

      options = options || {};
      var shareOwnerId = options.shareownerid;
      if (!shareOwnerId) {
        throw new Error('share-owner-id missing');
      }
      var shareSessionId = options.sharesessionid;
      if (!shareSessionId) {
        throw new Error('share-session-id missing');
      }

      Collection.apply(this);

      var self = this;

      this.shareChannels = firebaseDataService.shareChannels.child(shareOwnerId).child(shareSessionId);

      this.shareChannels.on('child_added', function(snapshot, prevChildKey) {
        var shareChannel = snapshot.val();
        shareChannel.id = snapshot.key;
        self.add(shareChannel);
        $rootScope.$broadcast(_SHARE_CHANNEL_ADDED_, {
          data: {
            shareChannel: shareChannel,
            index: self.length - 1
          }
        });
      });
      this.shareChannels.on('child_removed', function(prevSnapshot) {
        var shareChannel = prevSnapshot.val();
        shareChannel.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === shareChannel.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_SHARE_CHANNEL_REMOVED_, {
            data: {
              shareChannel: shareChannel,
              index: index
            }
          });
        }
      });
      this.shareChannels.on('child_changed', function(snapshot, prevChildKey) {
        var shareChannel = snapshot.val();
        shareChannel.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === shareChannel.id;
        });
        if (index > -1) {
          var oldShareSession = self[index];
          self[index] = shareChannel;
          $rootScope.$broadcast(_SHARE_CHANNEL_CHANGED_, {
            data: {
              newShareSession: shareChannel,
              oldShareSession: oldShareSession,
              index: index
            }
          });
        }
      });
      this.shareChannels.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialShareChannels)) {
          self.initialShareChannels = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialShareChannels);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    ShareChannels.prototype = Object.create(Collection.prototype);
    ShareChannels.prototype.constructor = ShareChannels;

    ShareChannels.prototype.onShareChannelAdded = function($scope, handler) {
      $scope.$on(_SHARE_CHANNEL_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareChannels.prototype.onShareChannelRemoved = function($scope, handler) {
      $scope.$on(_SHARE_CHANNEL_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareChannels.prototype.onShareChannelChanged = function($scope, handler) {
      $scope.$on(_SHARE_CHANNEL_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    ShareChannels.prototype.loaded = function() {
      if (angular.isDefined(this.initialShareChannels)) {
        return $q.when(this.initialShareChannels);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    ShareChannels.prototype.destroy = function() {
      this.shareChannels.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (ShareChannels);

  };

  shareChannelsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('ShareChannels', shareChannelsFactory);

})();
