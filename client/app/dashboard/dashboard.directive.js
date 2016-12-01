(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('tmplDashboard', directiveFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'A',
      templateUrl: 'app/dashboard/dashboard.html',
      scope: {
      },
      controller: 'DashboardCtrl',
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

})();
