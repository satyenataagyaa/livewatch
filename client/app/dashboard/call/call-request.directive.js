(function () {

  'use strict';

  angular.module('livewatchApp.dashboard')
    .directive('callRequest', directiveFunction)
    .controller('CallRequestCtrl', ControllerFunction);


  // ----- directiveFunction -----
  directiveFunction.$inject = [];

  /* @ngInject */
  function directiveFunction() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/dashboard/call/call-request.html',
      scope: {
        call: '=',
        uid: '=',
        onSelect: '&',
        onAnswer: '&'
      },
      controller: 'CallRequestCtrl'
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

    $scope.alerting = false;

    $scope.answer = answer;

    $scope.$on('$destroy', function() {
      storageCall.destroy();
    });

    storageCall.onOffererUpdated($scope, function(data) {
      if (!isUserCaller) {
        $timeout(function() {
          $scope.alerting = data.offerer;
        });
      }
    });

    storageCall.onAnswererUpdated($scope, function(data) {
      if (isUserCaller) {
        $timeout(function() {
          $scope.alerting = data.answerer;
        });
      }
    });

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

    function answer(ev) {
      ev.stopPropagation();
      $scope.onAnswer();
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
