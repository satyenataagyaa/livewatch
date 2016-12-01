(function() {
  'use strict';

  var callsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _CALL_ADDED_ = '_CALL_ADDED_';
    var _CALL_REMOVED_ = '_CALL_REMOVED_';
    var _CALL_CHANGED_ = '_CALL_CHANGED_';

    function CallModel(id, caller, callee, subject) {
      this.id = id;
      this.caller = caller;
      this.callee = callee;
      this.subject = subject;
      this.complete = false;
    }

    function Calls(options) {
      if (!(this instanceof Calls)) {
        var obj = Object.create(Calls.prototype);
        return Calls.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }

      Collection.apply(this);

      var self = this;

      this.calls = firebaseDataService.calls.child(uid);
      // this.calls = firebaseDataService.calls.child(uid)
      //                 .orderByChild('complete')
      //                 .equalTo(options.complete === true);

      this.calls.on('child_added', function(snapshot, prevChildKey) {
        var call = snapshot.val();
        call.id = snapshot.key;
        self.add(call);
        $rootScope.$broadcast(_CALL_ADDED_, {
          data: {
            call: call,
            index: self.length - 1
          }
        });
      });
      this.calls.on('child_removed', function(prevSnapshot) {
        var call = prevSnapshot.val();
        call.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === call.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_CALL_REMOVED_, {
            data: {
              call: call,
              index: index
            }
          });
        }
      });
      this.calls.on('child_changed', function(snapshot, prevChildKey) {
        var call = snapshot.val();
        call.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === call.id;
        });
        if (index > -1) {
          var oldCall = self[index];
          self[index] = call;
          $rootScope.$broadcast(_CALL_CHANGED_, {
            data: {
              newCall: call,
              oldCall: oldCall,
              index: index
            }
          });
        }
      });
      this.calls.on('value', function(snapshot) {
        if (angular.isUndefined(self.initialCalls)) {
          self.initialCalls = snapshot.val();
          if (angular.isDefined(self.loadedDeferred)) {
            self.loadedDeferred.resolve(self.initialCalls);
            delete self.loadedDeferred;
          }
        }
      });

      return this;
    }

    Calls.prototype = Object.create(Collection.prototype);
    Calls.prototype.constructor = Calls;

    Calls.prototype.onCallAdded = function($scope, handler) {
      $scope.$on(_CALL_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    Calls.prototype.onCallRemoved = function($scope, handler) {
      $scope.$on(_CALL_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    Calls.prototype.onCallChanged = function($scope, handler) {
      $scope.$on(_CALL_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    Calls.prototype.loaded = function() {
      if (angular.isDefined(this.initialCalls)) {
        return $q.when(this.initialCalls);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    Calls.prototype.destroy = function() {
      this.calls.off();
    };

    // Returns Promise
    Calls.prototype.makeCall = function(options) {
      options = options || {};
      var caller = options.caller;
      if (!caller) {
        throw new Error("Missing caller");
      }
      var callee = options.callee;
      if (!callee) {
        throw new Error("Missing callee");
      }

      var callerUid = caller.uid;
      var calleeUid = callee.uid;
      var newCallId = this.calls.push().key;
      var newCallModel = new CallModel(newCallId, callerUid, calleeUid, options.subject);
      var userData = {};
      userData[firebaseDataService.callsPath + '/' + callerUid + '/' + newCallId] = newCallModel;
      userData[firebaseDataService.callsPath + '/' + calleeUid + '/' + newCallId] = newCallModel;
      userData[firebaseDataService.callerMappingsPath + '/' + newCallId] = callerUid;
      return firebaseDataService.root.update(userData);
    };

    // Calls.prototype.makeActive = function(callId) {
    //   return this.calls.child(callId).child('active').set(true);
    // };

    // Calls.prototype.makeInactive = function(callId) {
    //   return this.calls.child(callId).child('active').set(null);
    // };

    Calls.prototype.markComplete = function(callId) {
      return this.calls.child(callId).child('complete').set(true);
    };

    // function updateCallProperty(calls, callId, prop, value) {
    //   var call = calls.find(function(c) {
    //     return c.id === callId;
    //   });
    //   if (!call) {
    //     throw new Error("Invalid callId");
    //   }
    //   var userData = {};
    //   userData[firebaseDataService.callsPath + '/' + call.caller + '/' + callId + '/' + prop] = value;
    //   userData[firebaseDataService.callsPath + '/' + call.callee + '/' + callId + '/' + prop] = value;
    //   return firebaseDataService.root.update(userData);
    // }

    // function updateCaller(calls, callId, joined) {
    //   if (joined !== true) {
    //     joined = null;
    //   }
    //   return updateCallProperty(calls, callId, 'callerJoined', joined);
    // }

    // function updateCallee(calls, callId, joined) {
    //   if (joined !== true) {
    //     joined = null;
    //   }
    //   return updateCallProperty(calls, callId, 'calleeJoined', joined);
    // }

    // Calls.prototype.makeCallerJoined = function(callId) {
    //   return updateCaller(this, callId, true);
    // };

    // Calls.prototype.makeCalleeJoined = function(callId) {
    //   return updateCallee(this, callId, true);
    // };

    // Calls.prototype.makeCallerLeft = function(callId) {
    //   return updateCaller(this, callId, false);
    // };

    // Calls.prototype.makeCalleeLeft = function(callId) {
    //   return updateCallee(this, callId, false);
    // };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Calls);

  };

  callsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('Calls', callsFactory);

})();
