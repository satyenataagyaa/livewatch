(function () {

  'use strict';

  angular.module('livewatchApp.done')
    .directive('completedCall', directiveFunction)
    .controller('CompletedCallCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/done/call/completed-call.html',
      scope: {
        call: '=',
        uid: '='
      },
      controller: 'CompletedCallCtrl'
    };

    return directive;
  }


  // ----- ControllerFunction -----
  ControllerFunction.$inject = ['$scope', '$timeout', 'Call', 'User'];

  /* @ngInject */
  function ControllerFunction($scope, $timeout, Call, User) {

    var storageCall = Call({
      uid: $scope.uid,
      callid: $scope.call.id
    });

    var isUserCaller = $scope.call.caller === $scope.uid;

    var callerUser,
        calleeUser;

    $scope.$on('$destroy', function() {
      storageCall.destroy();
    });

    $scope.redoCall = redoCall;
    $scope.deleteCall = deleteCall;

    function redoCall(call, ev) {
      console.log(arguments);
    }

    function deleteCall(call, ev) {
      console.log(arguments);
    }

    function qualifiedMemberName(member) {
      return member.uid === $scope.uid ? 'me' : member.name;
    }

    function formatMembers(caller, callee) {
      var names = [
        qualifiedMemberName(caller),
        qualifiedMemberName(callee)
      ];
      return names.join(', ');
    }

    function setMembership() {
      $scope.call.membership = formatMembers(callerUser, calleeUser);
    }

    User($scope.call.caller).loaded()
    .then(function(user) {
      callerUser = user;
      return User($scope.call.callee).loaded();
    }).then(function(user) {
      calleeUser = user;
      setMembership();
    });

  }

})();
