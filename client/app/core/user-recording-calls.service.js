(function() {
  'use strict';

  var userRecordingCallsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _USER_RECORDING_CALL_ADDED_ = '_USER_RECORDING_CALL_ADDED_';
    var _USER_RECORDING_CALL_REMOVED_ = '_USER_RECORDING_CALL_REMOVED_';
    var _USER_RECORDING_CALL_CHANGED_ = '_USER_RECORDING_CALL_CHANGED_';

    function UserRecordingCalls(options) {
      if (!(this instanceof UserRecordingCalls)) {
        var obj = Object.create(UserRecordingCalls.prototype);
        return UserRecordingCalls.apply(obj, arguments);
      }

      options = options || {};
      var uId = options.uid;
      if (!uId) {
        throw new Error('user-id missing');
      }

      Collection.apply(this);

      var self = this;

      this.userRecordingCalls = firebaseDataService.userRecordingCalls.child(uId);

      this.userRecordingCalls.on('child_added', function(snapshot, prevChildKey) {
        var userRecordingCall = snapshot.val();
        userRecordingCall.id = snapshot.key;
        self.add(userRecordingCall);
        $rootScope.$broadcast(_USER_RECORDING_CALL_ADDED_, {
          data: {
            userRecordingCall: userRecordingCall,
            index: self.length - 1
          }
        });
      });
      this.userRecordingCalls.on('child_removed', function(prevSnapshot) {
        var userRecordingCall = prevSnapshot.val();
        userRecordingCall.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === userRecordingCall.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_USER_RECORDING_CALL_REMOVED_, {
            data: {
              userRecordingCall: userRecordingCall,
              index: index
            }
          });
        }
      });
      this.userRecordingCalls.on('child_changed', function(snapshot, prevChildKey) {
        var userRecordingCall = snapshot.val();
        userRecordingCall.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === userRecordingCall.id;
        });
        if (index > -1) {
          var oldUserRecordingCall = self[index];
          self[index] = userRecordingCall;
          $rootScope.$broadcast(_USER_RECORDING_CALL_CHANGED_, {
            data: {
              newUserRecordingCall: userRecordingCall,
              oldUserRecordingCall: oldUserRecordingCall,
              index: index
            }
          });
        }
      });

      return this;
    }

    UserRecordingCalls.prototype = Object.create(Collection.prototype);
    UserRecordingCalls.prototype.constructor = UserRecordingCalls;

    UserRecordingCalls.prototype.onUserRecordingCallAdded = function($scope, handler) {
      $scope.$on(_USER_RECORDING_CALL_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    UserRecordingCalls.prototype.onUserRecordingCallRemoved = function($scope, handler) {
      $scope.$on(_USER_RECORDING_CALL_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    UserRecordingCalls.prototype.onUserRecordingCallChanged = function($scope, handler) {
      $scope.$on(_USER_RECORDING_CALL_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    UserRecordingCalls.prototype.destroy = function() {
      this.userRecordingCalls.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (UserRecordingCalls);

  };

  userRecordingCallsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('UserRecordingCalls', userRecordingCallsFactory);

})();