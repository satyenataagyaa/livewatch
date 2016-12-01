(function() {
  'use strict';

  angular
    .module('livewatchApp.done')
    .config(configFunction);

  configFunction.$inject = ['$stateProvider'];

  function configFunction($stateProvider) {

    $stateProvider
      .state('done', {
        url: '/done',
        template: '<tmpl-layout title="Done" view="done"></tmpl-layout>'
      });
  }

})();
