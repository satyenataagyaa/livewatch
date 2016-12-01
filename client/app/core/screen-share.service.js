(function() {
  'use strict';

  angular
    .module('livewatchApp.core')
    .factory('screenShareService', screenShareService);

  screenShareService.$inject = ['$rootScope'];

  var extensionInstalled = false;

  // listen for messages from the content-script
  window.addEventListener('message', function (event) {
    if (event.origin != window.location.origin) return;

    // content-script will send a 'SS_PING' msg if extension is installed
    if (event.data.type && (event.data.type === 'SS_PING')) {
      extensionInstalled = true;
    }
  });

  function screenShareService($rootScope) {

    var _SS_MESSAGE_ = '_SS_MESSAGE_';

    var service = {
      enabled: enabled,
      onMessage: onMessage
    };

    // listen for messages from the content-script
    window.addEventListener('message', function (event) {
      if (event.origin == window.location.origin) {
        if (event.data.type !== 'SS_PING') {
          $rootScope.$broadcast(_SS_MESSAGE_, {
            data: event.data
          });
        }
      }
    });

    function enabled() {
      return extensionInstalled;
    }

    function onMessage($scope, handler) {
      return $scope.$on(_SS_MESSAGE_, function(event, args) {
        handler(args.data);
      });
    }

    return service;
  }

})();
