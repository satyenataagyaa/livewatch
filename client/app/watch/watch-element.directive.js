(function () {

  'use strict';

  angular.module('livewatchApp.watch')
    .directive('watchElement', directiveFunction)
    .controller('WatchElementCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/watch/watch-element.html',
      scope: {
        sess: '=',
        uid: '=',
        onSelect: '&',
        // onAnswer: '&'
      },
      controller: 'WatchElementCtrl'
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope', '$timeout', 'User'];

  /* @ngInject */
  function ControllerFunction($scope, $timeout, User) {

    User($scope.sess.owner).loaded()
    .then(function(user) {
      $scope.sess.ownerName = user.name;
    });

  }

})();
