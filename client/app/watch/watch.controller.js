(function() {
  'use strict';

  angular
    .module('livewatchApp.watch')
    .controller('WatchCtrl', WatchCtrl);

  WatchCtrl.$inject = ['$scope', '$timeout', 'authService', 'ShareSessions'];

  function WatchCtrl($scope, $timeout, authService, ShareSessions) {

    var vm = this;

    vm.myUid = authService.getUid();
    vm.sessions = new ShareSessions({
      uid: vm.myUid
    });
    vm.sessions.onShareSessionAdded($scope, function(data) {
      $timeout(function() {
        render();
      });
    });
    vm.sessions.onShareSessionRemoved($scope, function(data) {
      $timeout(function() {
        var session = data.shareSession;
        if (angular.isDefined(vm.activeSession)) {
          if (vm.activeSession.id === session.id) {
            delete vm.activeSession;
            render();
          }
        } else {
          render();
        }
      });
    });

    // vm.sessions.onBroadcastSessionChanged($scope, function(data) {
    //   var newSession = data.newBroadcastSession;
    //   var oldSession = data.oldBroadcastSession;
    //   if (newSession.active !== oldSession.active) {
    //     render();
    //   }
    // });

    vm.makeActive = makeActive;
    vm.makeInactive = makeInactive;

    function makeActive(sess) {
      vm.activeSession = sess;
      render();
    }

    function makeInactive() {
      delete vm.activeSession;
      render();
    }

    function render() {
      vm.sessionsBeforeActive = [];
      vm.sessionsAfterActive = [];
      var activeIndex = -1;
      if (angular.isDefined(vm.activeSession)) {
        activeIndex = vm.sessions.findIndex(function(sess) {
          return sess.id === vm.activeSession.id;
        });
      }
      var n = (activeIndex === -1) ? vm.sessions.length : activeIndex;
      for (var i = 0; i < n; i++) {
        vm.sessionsBeforeActive.push(vm.sessions[i]);
      }
      for (var i = n + 1; i < vm.sessions.length; i++) {
        vm.sessionsAfterActive.push(vm.sessions[i]);
      }
    }

    render();

  }

})();
