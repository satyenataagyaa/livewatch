'use strict';

angular.module('livewatchApp')
  .controller('LayoutController', function ($mdMedia, $mdSidenav, $mdDialog, $scope, $timeout, $location, authService, User) {

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.navHidden = true;

    // $scope.toggleLeft = function() {
    //   // $mdSidenav('left').toggle();
    //   $scope.navHidden = !$scope.navHidden;
    // };

    // Sidenav toggle
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.$watch(function() {
      return $mdMedia('gt-md');
    }, function(gtMd) {
      if (gtMd) {
        $scope.a1 = 15;
        $scope.a2 = 80;
      } else {
        $scope.a1 = 25;
        $scope.a2 = 90;
      }
      $scope.a3 = (100 - $scope.a2)/2;
    });

    // $scope.currentUser = authService.getUser();
    User(authService.getUid()).loaded()
    .then(function(user) {
      $timeout(function() {
        $scope.currentUser = user;
      });
    });

    // Menu items
   	$scope.menu = [
      {
        link : '',
        sref : 'dashboard',
        title: 'Live',
        icon: 'webaction:ic_dashboard_24px' // we have to use Google's naming convention for the IDs of the SVGs in the spritesheet
      },
      {
        link : '',
        sref : 'watch',
        title: 'Watch',
        icon: 'webaction:ic_supervisor_account_24px'
      },
      {
        link : '',
        sref : 'done',
        title: 'Done',
        icon: 'webaction:ic_done_24px'
      }
    ];
    $scope.admin = [
      {
        link : '',
        sref : 'trash',
        title: 'Trash',
        icon: 'webaction:ic_delete_24px'
      },
      {
        link : 'showListBottomSheet($event)',
        title: 'Settings',
        icon: 'webaction:ic_settings_24px'
      }
    ];

    var originatorEv;
    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.notificationsEnabled = true;
    $scope.toggleNotifications = function() {
      $scope.notificationsEnabled = !$scope.notificationsEnabled;
    };

    $scope.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .content('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
        );
      originatorEv = null;
    };

    $scope.checkVoicemail = function() {
      // This never happens.
    };

    $scope.showAddDialog = function($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'components/shell/dialog/dialog.html',
        controller: 'DialogController'
      });
    };
    $scope.logout = function() {
      authService.logout();
    };
  });
