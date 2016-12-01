'use strict';

angular.module('livewatchApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngMessages',
  'ui.router',
  'ngMaterial',

  'livewatchApp.auth',
  'livewatchApp.core',
  'livewatchApp.dashboard',
  'livewatchApp.watch',
  'livewatchApp.done'
])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet('action', '../assets/iconsets/action-icons.svg', 24)
      .iconSet('webaction', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-action.svg', 24)
      .iconSet('alert', '../assets/iconsets/alert-icons.svg', 24)
      .iconSet('av', '../assets/iconsets/av-icons.svg', 24)
      .iconSet('communication', '../assets/iconsets/communication-icons.svg', 24)
      .iconSet('webcommunication', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-communication.svg', 24)
      .iconSet('content', '../assets/iconsets/content-icons.svg', 24)
      .iconSet('webcontent', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-content.svg', 24)
      .iconSet('device', '../assets/iconsets/device-icons.svg', 24)
      .iconSet('editor', '../assets/iconsets/editor-icons.svg', 24)
      .iconSet('file', '../assets/iconsets/file-icons.svg', 24)
      .iconSet('hardware', '../assets/iconsets/hardware-icons.svg', 24)
      .iconSet('icons', '../assets/iconsets/icons-icons.svg', 24)
      .iconSet('image', '../assets/iconsets/image-icons.svg', 24)
      .iconSet('maps', '../assets/iconsets/maps-icons.svg', 24)
      .iconSet('navigation', '../assets/iconsets/navigation-icons.svg', 24)
      .iconSet('webnavigation', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-navigation.svg', 24)
      .iconSet('notification', '../assets/iconsets/notification-icons.svg', 24)
      .iconSet('social', '../assets/iconsets/social-icons.svg', 24)
      .iconSet('websocial', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-social.svg', 24)
      .iconSet('toggle', '../assets/iconsets/toggle-icons.svg', 24)
      .iconSet('avatar', '../assets/iconsets/avatar-icons.svg', 128)
      .iconSet('avatars', 'https://raw.githubusercontent.com/angular/material/master/docs/app/icons/avatar-icons.svg', 24)
      .iconSet('mdi', '../assets/iconsets/mdi-icons.svg', 24);
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(['$location', 'PROTECTED_PATHS', 'loginRedirectPath',
    function($location, PROTECTED_PATHS, loginRedirectPath) {

      // Initialize Firebase
      var config = {
        apiKey: "AIzaSyB3lic7aqnioaUp6d91mZcW9Qw6nno6wJM",
        authDomain: "project-8938875282540089866.firebaseapp.com",
        databaseURL: "https://project-8938875282540089866.firebaseio.com",
        storageBucket: "project-8938875282540089866.appspot.com",
      };
      firebase.initializeApp(config);

      // watch for login status changes and redirect if appropriate
      firebase.auth().onAuthStateChanged(check);

      function check(user) {
        if (!user && authRequired($location.path())) {
          console.log('check failed', user, $location.path());  // debug
          $location.path(loginRedirectPath);
        }
      }

      function authRequired(path) {
        console.log('authRequired?', path, PROTECTED_PATHS.indexOf(path));  // debug
        return PROTECTED_PATHS.indexOf(path) !== -1;
      }
    }
  ]);
