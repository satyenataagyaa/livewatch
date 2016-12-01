(function() {
  'use strict';

  angular.module('livewatchApp.dashboard')
    .controller('MakeCallController', function($scope, $q, $mdDialog, Users, callSettings) {

      var caller = callSettings.caller;

      var pendingSearch, cancelSearch = angular.noop;
      var cachedQuery, lastSearch;

      $scope.call = {
      };

      /**
       * Async search for users
       * Also debounce the queries; since the md-contact-chips does not support this
       */
      $scope.delayedQuerySearch = function(criteria) {
        cachedQuery = criteria;
        if (!pendingSearch || !debounceSearch()) {
          cancelSearch();
          return pendingSearch = $q(function(resolve, reject) {
            cancelSearch = reject;
            var users = Users({
              criteria: criteria
            });
            users.loaded()
            .then(function() {
              resolve(users.filter(function(userModel) {
                return userModel.email !== caller.email;
              }).map(function(userModel) {
                return {
                  uid: userModel.uid,
                  name: userModel.name,
                  email: userModel.email
                };
              }));
              users.destroy();
              refreshDebounce();
            });
          });
        }
        return pendingSearch;
      };

      function refreshDebounce() {
        lastSearch = 0;
        pendingSearch = null;
        cancelSearch = angular.noop;
      }

      /**
       * Debounce if querying faster than 300ms
       */
      function debounceSearch() {
        var now = new Date().getMilliseconds();
        lastSearch = lastSearch || now;
        return ((now - lastSearch) < 300);
      }

      $scope.make = function() {
        // $mdDialog.hide($scope.call);
        $mdDialog.hide({
          caller: caller,
          callee: $scope.call.callee,
          subject: $scope.call.subject
        });
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };
  });
})();
