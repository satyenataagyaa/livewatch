(function() {
  'use strict';

  var userFriendsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _USER_FRIEND_ADDED_ = '_USER_FRIEND_ADDED_';
    var _USER_FRIEND_REMOVED_ = '_USER_FRIEND_REMOVED_';

    function UserFriends(options) {
      if (!(this instanceof UserFriends)) {
        var obj = Object.create(UserFriends.prototype);
        return UserFriends.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var criteria = options.criteria;

      Collection.apply(this);

      var self = this;

      this.userFriends = firebaseDataService.userFriends.child(uid).orderByChild('name');
      if (criteria) {
        this.userFriends = this.userFriends.startAt(criteria).endAt(criteria + '~');
      }

      this.userFriends.on('child_added', function(snapshot, prevChildKey) {
        var userFriend = snapshot.val();
        userFriend.uid = snapshot.key;
        self.add(userFriend);
        $rootScope.$broadcast(_USER_FRIEND_ADDED_, {
          data: {
            userFriend: userFriend,
            index: self.length - 1
          }
        });
      });
      this.userFriends.on('child_removed', function(prevSnapshot) {
        var userFriend = prevSnapshot.val();
        userFriend.uid = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.email === userFriend.email;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_USER_FRIEND_REMOVED_, {
            data: {
              userFriend: userFriend,
              index: index
            }
          });
        }
      });
      this.userFriends.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialUserFriends)) {
          self.initialUserFriends = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialUserFriends);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    UserFriends.prototype = Object.create(Collection.prototype);
    UserFriends.prototype.constructor = UserFriends;

    UserFriends.prototype.onUserFriendAdded = function($scope, handler) {
      $scope.$on(_USER_FRIEND_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    UserFriends.prototype.onUserFriendRemoved = function($scope, handler) {
      $scope.$on(_USER_FRIEND_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    UserFriends.prototype.loaded = function() {
      if (angular.isDefined(this.initialUserFriends)) {
        return $q.when(this.initialUserFriends);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    UserFriends.prototype.destroy = function() {
      this.userFriends.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (UserFriends);

  };

  userFriendsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('UserFriends', userFriendsFactory);

})();
