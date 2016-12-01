(function() {
  'use strict';

  angular
    .module('livewatchApp.core')
    // .constant('FIREBASE_URL', 'https://aagyaa-live.firebaseio.com/')
    .constant('loginRedirectPath', '/login')
    .constant('PROTECTED_PATHS', ['/', '/watch', '/done']);

})();