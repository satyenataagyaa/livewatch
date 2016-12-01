(function () {

  'use strict';

  angular.module('livewatchApp.watch')
    .directive('broadcastViewer', directiveFunction)
    .controller('BroadcastViewerCtrl', ControllerFunction);


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
      templateUrl: 'app/watch/broadcast-viewer.html',
      scope: {
        channels: '=',
        sessionId: '@',
        ownerId: '@',
        uid: '='
      },
      controller: 'BroadcastViewerCtrl',
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
