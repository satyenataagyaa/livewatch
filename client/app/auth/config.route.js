(function() {
  'use strict';

  angular
    .module('livewatchApp.auth')
    .config(configFunction);

  configFunction.$inject = ['$stateProvider'];

  function configFunction($stateProvider) {

    $stateProvider
      .state('login', {
        url: '/login',
        template: '<tmpl-login></tmpl-login>'
      });
  }

})();
