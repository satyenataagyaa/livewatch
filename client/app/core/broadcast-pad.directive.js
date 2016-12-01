(function () {

  'use strict';

  angular.module('livewatchApp.core')
    .directive('broadcastPad', directiveFunction)
    .controller('BroadcastPadCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['$q', 'BroadcastPad'];

  /* @ngInject */
  function directiveFunction($q, BroadcastPad) {

    function link(scope, iElement, iAttrs, controller) {

      var firepadContainer = iElement[0].querySelector('#firepad-container');

      var storageBroadcastPad = BroadcastPad({
        uid: scope.uid,
        broadcastownerid: scope.broadcastOwnerId,
        broadcastsessionid: scope.sessionId,
        padcontainer: firepadContainer
      });

      function isUserBroadcastOwner() {
        return scope.broadcastOwnerId === scope.uid;
      }

      function start() {
        storageBroadcastPad.loaded()
        .then(function() {
          scope.firepadContainerHeight = firepadContainer.offsetWidth * 0.75;
          console.log('Firepad loaded!');
        });
      }

      iElement.ready(start);

      iElement.on('$destroy', function() {
        var promise = isUserBroadcastOwner() ? storageBroadcastPad.deleteHistory() : $q.when();
        promise.then(function() {
          storageBroadcastPad.dispose();
        });
      });

    }

    var directive = {
      restrict: 'E',
      template: '<div id="firepad-container" md-whiteframe="3" ng-style="firepadContainerStyle()"></div>',
      scope: {
        sessionId: '@',
        broadcastOwnerId: '@',
        uid: '='
      },
      controller: 'BroadcastPadCtrl',
      link: link
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope'];

  /* @ngInject */
  function ControllerFunction($scope) {

    $scope.firepadContainerStyle = function() {
      return {
        'max-height': '400px',
        height: $scope.firepadContainerHeight + 'px'
      };
    };
  }

})();
