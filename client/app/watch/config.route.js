(function() {
  'use strict';

  angular
    .module('livewatchApp.watch')
    .config(configFunction);

  configFunction.$inject = ['$stateProvider'];

  function configFunction($stateProvider) {

    $stateProvider
      .state('watch', {
        url: '/watch',
        template: '<tmpl-layout title="Watch" view="watch"></tmpl-layout>'
      });
  }

})();
