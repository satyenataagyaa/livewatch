(function() {
  'use strict';

  var usersFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _USER_ADDED_ = '_USER_ADDED_';
    var _USER_REMOVED_ = '_USER_REMOVED_';

    function Users(options) {
      if (!(this instanceof Users)) {
        var obj = Object.create(Users.prototype);
        return Users.apply(obj, arguments);
      }

      options = options || {};
      var criteria = options.criteria;

      Collection.apply(this);

      var self = this;

      this.users = firebaseDataService.users.orderByChild('email');
      if (criteria) {
        this.users = this.users.startAt(criteria).endAt(criteria + '~');
      }

      this.users.on('child_added', function(snapshot, prevChildKey) {
        var user = snapshot.val();
        self.add(user);
        $rootScope.$broadcast(_USER_ADDED_, {
          data: {
            user: user,
            index: self.length - 1
          }
        });
      });
      this.users.on('child_removed', function(prevSnapshot) {
        var user = prevSnapshot.val();
        var index = self.findIndex(function(element) {
          return element.email === user.email;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_USER_REMOVED_, {
            data: {
              user: user,
              index: index
            }
          });
        }
      });
      this.users.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialUsers)) {
          self.initialUsers = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialUsers);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    Users.prototype = Object.create(Collection.prototype);
    Users.prototype.constructor = Users;

    Users.prototype.onUserAdded = function($scope, handler) {
      $scope.$on(_USER_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    Users.prototype.onUserRemoved = function($scope, handler) {
      $scope.$on(_USER_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    Users.prototype.loaded = function() {
      if (angular.isDefined(this.initialUsers)) {
        return $q.when(this.initialUsers);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    Users.prototype.destroy = function() {
      this.users.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Users);

  };

  usersFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('Users', usersFactory);

})();
