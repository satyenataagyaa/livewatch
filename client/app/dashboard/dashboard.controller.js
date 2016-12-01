(function() {
  'use strict';

  angular
    .module('livewatchApp.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', '$timeout', 'authService', 'Calls', 'User', '$mdDialog'];

  function DashboardCtrl($scope, $timeout, authService, Calls, User, $mdDialog) {

    var vm = this;

    vm.myUid = authService.getUid();
    vm.calls = new Calls({
      uid: vm.myUid
    });
    vm.calls.onCallAdded($scope, function(data) {
      $timeout(function() {
        render();
      });
    });

    vm.calls.onCallChanged($scope, function(data) {
      var newCall = data.newCall;
      var oldCall = data.oldCall;
      if (newCall.active !== oldCall.active) {
        render();
      }
    });

    vm.makeActive = makeActive;
    vm.makeInactive = makeInactive;
    vm.showMakeCallDialog = showMakeCallDialog;

    function isUserCaller(call) {
      return call.caller === vm.myUid;
    }

    function makeActive(call) {
      vm.activeCall = call;
      render();
    }

    function makeInactive(complete) {
      if (complete) {
        vm.calls.markComplete(vm.activeCall.id);
      }
      delete vm.activeCall;
      $timeout(function() {
        render();
      });
    }

    function showMakeCallDialog(ev) {
      ev.stopPropagation();
      var caller = User(vm.myUid);
      caller.loaded()
      .then(function(callerModel) {
        $mdDialog.show({
          controller: 'MakeCallController',
          templateUrl: 'app/dashboard/call/make-call.html',
          targetEvent: ev,
          locals: {
            callSettings: {
              caller: callerModel
            }
          }
        }).then(function(callSettings) {
          return vm.calls.makeCall({
            caller: callSettings.caller,
            callee: callSettings.callee,
            subject: callSettings.subject
          });
        }, function() {
          console.log('Make Call cancelled.');
        });
      });
    }

    function render() {
      vm.callsBeforeActive = [];
      vm.callsAfterActive = [];
      var activeIndex = -1;
      if (angular.isDefined(vm.activeCall)) {
        activeIndex = vm.calls.findIndex(function(call) {
          return call.id === vm.activeCall.id;
        });
      }
      var n = (activeIndex === -1) ? vm.calls.length : activeIndex;
      for (var i = 0; i < n; i++) {
        vm.callsBeforeActive.push(vm.calls[i]);
      }
      for (var i = n + 1; i < vm.calls.length; i++) {
        vm.callsAfterActive.push(vm.calls[i]);
      }
    }

    render();

  }

})();
