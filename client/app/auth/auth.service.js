(function() {
  'use strict';

  angular
    .module('livewatchApp.auth')
    .factory('authService', authService);

  // authService.$inject = ['$firebaseAuth', 'firebaseDataService', 'fbutil'];
  authService.$inject = ['firebaseDataService'];

  // function authService($firebaseAuth, firebaseDataService, fbutil) {
  function authService(firebaseDataService) {
    // var firebaseAuthObject = $firebaseAuth(firebaseDataService.root);
    var firebaseAuthObject = firebase.auth();
    // var currentUid;
    var currentUser = null;

    firebaseAuthObject.onAuthStateChanged(check);

    var service = {
      firebaseAuthObject: firebaseAuthObject,
      googleLogin: googleLogin,
      // register: register,
      // login: login,
      logout: logout,
      isLoggedIn: isLoggedIn,
      // getEmail: getEmail,
      // getEncodedEmail: getEncodedEmail,
      getUser: getUser,
      getUid: getUid,
      createUser: createUser
    };

    return service;

    ////////////

    function check(user) {
      if (user != null) {
        currentUser = {
          displayName: user.displayName,
          email: user.email,
          uid: user.uid
        };
      } else {
        currentUser = null;
      }
      // currentUid = user ? user.uid : undefined;
    }

    function googleLogin() {
      // return firebaseAuthObject.$authWithOAuthPopup("google", { scope: 'email' });
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/plus.login');
      // firebase.auth().signInWithPopup(provider).then(function(result) {
      //   // This gives you a Google Access Token. You can use it to access the Google API.
      //   var token = result.credential.accessToken;
      //   // The signed-in user info.
      //   var user = result.user;
      //   console.log('user:', user);
      //   // document.getElementById('quickstart-oauthtoken').textContent = token;
      //   console.log('token:', token);
      // }).catch(function(error) {
      //   // Handle Errors here.
      //   var errorCode = error.code;
      //   var errorMessage = error.message;
      //   // The email of the user's account used.
      //   var email = error.email;
      //   // The firebase.auth.AuthCredential type that was used.
      //   var credential = error.credential;
      //   if (errorCode === 'auth/account-exists-with-different-credential') {
      //     alert('You have already signed up with a different auth provider for that email.');
      //     // If you are using multiple auth providers on your app you should handle linking
      //     // the user's accounts here.
      //   } else {
      //     console.error(error);
      //   }
      // });
      return firebaseAuthObject.signInWithPopup(provider);
    }

    // function register(user) {
    //   return firebaseAuthObject.$createUser(user);
    // }

    function login(user) {
      return firebaseAuthObject.signInWithEmailAndPassword(user.email, user.password);
    }
    // function login(user) {
    //   return firebaseAuthObject.$authWithPassword(user);
    // }

    function logout() {
      // shareService.reset();
      firebaseAuthObject.signOut();
    }

    function isLoggedIn() {
      // return firebaseAuthObject.currentUser != null;
      return currentUser != null;
    }

    function getUser() {
      return currentUser;
    }

    // function getEmail() {
    //   var auth = isLoggedIn();
    //   if (!auth) {
    //     throw new Error('User is not logged in');
    //   }
    //   var email;
    //   if (auth.provider === 'password') {
    //     email = auth.password.email;
    //   } else if (auth.provider === 'google') {
    //     email = auth.google.email;
    //   }
    //   if (angular.isUndefined(email)) {
    //     throw new Error('User logged in with unknown provider');
    //   }
    //   return email;
    // }
    // function getEncodedEmail() {
    //   var auth = isLoggedIn();
    //   if (!auth) {
    //     throw new Error('User is not logged in');
    //   }
    //   var unprocessedEmail;
    //   if (auth.provider === 'password') {
    //     unprocessedEmail = auth.password.email;
    //   } else if (auth.provider === 'google') {
    //     unprocessedEmail = auth.google.email;
    //   }
    //   if (angular.isUndefined(unprocessedEmail)) {
    //     throw new Error('User logged in with unknown provider');
    //   }
    //   return fbutil.encodeEmail(unprocessedEmail);
    // }
    function getUid() {
      if (currentUser != null) {
        return currentUser.uid;
      }
    }
    // function getUid() {
    //   var user = firebaseAuthObject.currentUser;
    //   if (!user) {
    //     throw new Error('User is not logged in');
    //   }
    //   return user.uid;
    // }

    function createUser(uid, email, name, photo) {
      return firebase.database().ref(firebaseDataService.usersPath + '/' + uid).set({
        uid: uid,
        email: email,
        name: name,
        photo: photo
      }).catch(function() {
        // swallow the error
      });
    }
    // function createUser(uid, encodedEmail, name) {
    //   // Create the data we want to update
    //   var userData = {};
    //   userData[firebaseDataService.usersPath + '/' + encodedEmail] = {
    //     email: encodedEmail,
    //     name: name
    //   };
    //   userData[firebaseDataService.uidMappingsPath + '/' + uid] = encodedEmail;
    //   return fbutil.handler(function(cb) {
    //     // Do a deep-path update
    //     firebaseDataService.root.update(userData, cb);
    //   }).catch(function() {
    //     // Try just making a uid mapping
    //     userData = {};
    //     userData[firebaseDataService.uidMappingsPath + '/' + uid] = encodedEmail;
    //     return fbutil.handler(function(cb) {
    //       // Do a deep-path update
    //       firebaseDataService.root.update(userData, cb);
    //     }).catch(function() {
    //       // swallow the error
    //     });
    //   });
    // }
  }

})();
