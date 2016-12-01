(function() {
  'use strict';

  angular
    .module('livewatchApp.done')
    .controller('DoneCtrl', DoneCtrl);

  DoneCtrl.$inject = ['$scope', '$timeout', 'authService', 'Calls'];

  function DoneCtrl($scope, $timeout, authService, Calls) {

    var vm = this;

    vm.myUid = authService.getUid();
    vm.completedCalls = [];

    var calls = new Calls({
      uid: vm.myUid,
      complete: true
    });
    calls.onCallAdded($scope, function(data) {
      $timeout(function() {
        vm.completedCalls.push(data.call);
      });
    });

    // vm.calls.onCallChanged($scope, function(data) {
    //   var newCall = data.newCall;
    //   var oldCall = data.oldCall;
    //   if (newCall.active !== oldCall.active) {
    //     render();
    //   }
    // });

    // function isUserCaller(call) {
    //   return call.caller === vm.myUid;
    // }

  }

})();
