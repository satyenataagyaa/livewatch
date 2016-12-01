(function () {

  'use strict';

  angular.module('livewatchApp')
    .directive('tmplLayout', directiveFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'components/layout/layout.html',
      scope: {
        title: '@',
        view: '@'
      },
      controller: 'LayoutController'
    };

    return directive;
  }

})();
