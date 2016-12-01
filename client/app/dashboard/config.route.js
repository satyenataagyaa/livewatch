(function() {
  'use strict';

  angular
    .module('livewatchApp.dashboard')
    .config(configFunction);

  configFunction.$inject = ['$stateProvider'];

  function configFunction($stateProvider) {

    $stateProvider
      .state('dashboard', {
        url: '/',
        template: '<tmpl-layout title="Live" view="dashboard"></tmpl-layout>'
      });
  }

})();
