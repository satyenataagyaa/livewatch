(function() {
  'use strict';

  var userFactory = function($q, firebaseDataService) {

    function User(uid) {
      if (!(this instanceof User)) {
        var obj = Object.create(User.prototype);
        return User.apply(obj, arguments);
      }

      if (!uid) {
        throw new Error('uid missing');
      }

      var self = this;

      firebaseDataService.users.child(uid).once('value')
        .then(function(snapshot) {
          self.user = snapshot.val();
          self.user.uid = snapshot.key;
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.user);
            delete self.loadedDeferred;
          }
        });

      return this;
    }

    User.prototype.loaded = function() {
      if (angular.isDefined(this.user)) {
        return $q.when(this.user);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (User);

  };

  userFactory.$inject = ['$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('User', userFactory);

})();
