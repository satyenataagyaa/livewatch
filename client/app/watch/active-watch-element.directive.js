(function () {

  'use strict';

  angular.module('livewatchApp.watch')
    .directive('activeWatchElement', directiveFunction)
    .controller('ActiveWatchElementCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/watch/active-watch-element.html',
      scope: {
        sess: '=',
        uid: '=',
        onClose: '&'
      },
      controller: 'ActiveWatchElementCtrl'
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope', '$timeout', 'ShareChannels'];

  /* @ngInject */
  function ControllerFunction($scope, $timeout, ShareChannels) {

    var storageShareChannels = ShareChannels({
      shareownerid: $scope.sess.owner,
      sharesessionid: $scope.sess.id
    });

    // $scope.broadcastChannels = [];
    $scope.shareVideoChannel = null;
    $scope.shareScreenChannel = null;

    $scope.close = close;

    $scope.$on('$destroy', function() {
      storageShareChannels.destroy();
    });

    storageShareChannels.onShareChannelAdded($scope, function(data) {
      $timeout(function() {
        var shareChannel = data.shareChannel;
        // $scope.broadcastChannels.push(broadcastChannel);
        if (shareChannel.type === 'video') {
          $scope.shareVideoChannel = shareChannel;
        } else if (shareChannel.type === 'screen') {
          $scope.shareScreenChannel = shareChannel;
        }
      });
    });

    function hangupShareViewer() {
      $scope.$broadcast('hangup-share-viewer');
    }

    function close() {
      hangupShareViewer();
      $scope.onClose();
    }

  }

})();