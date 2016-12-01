(function () {

  'use strict';

  angular.module('livewatchApp.watch')
    .directive('tmplWatch', directiveFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'A',
      templateUrl: 'app/watch/watch.html',
      scope: {
      },
      controller: 'WatchCtrl',
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

})();
