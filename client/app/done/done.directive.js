(function () {

  'use strict';

  angular.module('livewatchApp.done')
    .directive('tmplDone', directiveFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'A',
      templateUrl: 'app/done/done.html',
      scope: {
      },
      controller: 'DoneCtrl',
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

})();
