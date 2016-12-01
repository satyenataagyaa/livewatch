(function () {

  'use strict';

  angular.module('livewatchApp.auth')
    .directive('tmplLogin', directiveFunction)
    .controller('LoginController', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/auth/login.html',
      scope: {
      },
      controller: 'LoginController',
      controllerAs: 'vm'
    };

    return directive;
  }


  // ----- ControllerFunction -----
  // ControllerFunction.$inject = ['$location', 'logger', 'authService', 'fbutil'];
  ControllerFunction.$inject = ['$scope', '$location', 'logger', 'authService'];

  /* @ngInject */
  // function ControllerFunction($location, logger, authService, fbutil) {
  function ControllerFunction($scope, $location, logger, authService) {

    var vm = this;

    vm.login = login;
    vm.googleLogin = googleLogin;

    function login(user) {
      return authService.login(user)
        .then(function(authenticatedUser) {
          // create a user profile in our data store
          return authService.createUser(authenticatedUser.uid, authenticatedUser.email, authenticatedUser.displayName, authenticatedUser.photoURL);
        })
        .then(function() {
          $scope.$apply(function() {
            $location.path('/');
          });
        })
        .catch(function(error) {
          vm.error = error;
        });
    }
    // function login(user) {
    //   return authService.login(user)
    //     .then(function(authenticatedUser) {
    //       // create a user profile in our data store
    //       var encodedEmail = fbutil.encodeEmail(user.email);
    //       return authService.createUser(authenticatedUser.uid, encodedEmail, user.name||firstPartOfEmail(user.email));
    //     })
    //     .then(function() {
    //       $location.path('/');
    //     })
    //     .catch(function(error) {
    //       vm.error = error;
    //     });
    // }

    function googleLogin() {
      return authService.googleLogin()
        .then(function(result) {
          var user = result.user;
          // create a user profile in our data store
          return authService.createUser(user.uid, user.email, user.displayName, user.photoURL);
        })
        .then(function() {
          $scope.$apply(function() {
            $location.path('/');
          });
        })
        .catch(function(error) {
          console.error(error);
          vm.error = error;
        });
    }
    // function googleLogin() {
    //   return authService.googleLogin()
    //     .then(function(user) {
    //       // create a user profile in our data store
    //       var encodedEmail = fbutil.encodeEmail(user.google.email);
    //       return authService.createUser(user.uid, encodedEmail, user.google.displayName);
    //     })
    //     .then(function() {
    //       $location.path('/');
    //     })
    //     .catch(function(error) {
    //       vm.error = error;
    //     });
    // }

    // function firstPartOfEmail(email) {
    //   return ucfirst(email.substr(0, email.indexOf('@'))||'');
    // }

    // function ucfirst(str) {
    //   // inspired by: http://kevin.vanzonneveld.net
    //   str += '';
    //   var f = str.charAt(0).toUpperCase();
    //   return f + str.substr(1);
    // }

    activate();

    function activate() {
      logger.log('Activated Login View');
    }
  }

})();
