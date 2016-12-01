(function () {

  'use strict';

  angular.module('livewatchApp.core')
    .directive('sharePad', directiveFunction)
    .controller('SharePadCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = ['SharePad'];

  /* @ngInject */
  function directiveFunction(SharePad) {

    function link(scope, iElement, iAttrs, controller) {

      var firepadContainer = iElement[0].querySelector('#firepad-container');

      var storageSharePad = SharePad({
        uid: scope.uid,
        ownerid: scope.ownerId,
        callid: scope.callId,
        padcontainer: firepadContainer
      });

      // function isUserShareOwner() {
      //   return scope.ownerId === scope.uid;
      // }

      function start() {
        storageSharePad.loaded()
        .then(function() {
          scope.firepadContainerHeight = firepadContainer.offsetWidth * 0.75;
          // console.log('Firepad loaded!');
        });
      }

      iElement.ready(start);

      iElement.on('$destroy', function() {
        storageSharePad.dispose();
      });
      // iElement.on('$destroy', function() {
      //   var promise = isUserShareOwner() ? storageSharePad.deleteHistory() : $q.when();
      //   promise.then(function() {
      //     storageSharePad.dispose();
      //   });
      // });

    }

    var directive = {
      restrict: 'E',
      template: '<div id="firepad-container" md-whiteframe="3" ng-style="firepadContainerStyle()"></div>',
      scope: {
        callId: '@',
        ownerId: '@',
        uid: '='
      },
      controller: 'SharePadCtrl',
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
