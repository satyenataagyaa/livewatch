(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('broadcastOwner', directiveFunction)
    .controller('BroadcastOwnerCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    function link(scope, iElement, iAttrs, controller) {

      iElement.on('$destroy', function() {
      });

    }

    var directive = {
      restrict: 'E',
      templateUrl: 'app/dashboard/call/broadcast-owner.html',
      scope: {
        channels: '=',
        friends: '=',
        sessionId: '@',
        uid: '='
      },
      controller: 'BroadcastOwnerCtrl',
      link: link
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope'];

  /* @ngInject */
  function ControllerFunction($scope) {

  }

})();
