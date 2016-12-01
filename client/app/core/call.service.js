(function() {
  'use strict';

  var callFactory = function($rootScope, $q, firebaseDataService) {

    var _OFFERER_UPDATED_ = '_OFFERER_UPDATED_';
    var _ANSWERER_UPDATED_ = '_ANSWERER_UPDATED_';

    function Call(options) {
      if (!(this instanceof Call)) {
        var obj = Object.create(Call.prototype);
        return Call.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var callid = options.callid;
      if (!callid) {
        throw new Error('call-id missing');
      }

      var self = this;

      this.uid = uid;
      this.call = firebaseDataService.calls.child(uid).child(callid);

      this.call.on('value', function(snapshot) {
        var prevValue = self.value;
        self.value = snapshot.val();
        self.value.id = snapshot.key;
        self.isUserCaller = (self.value.caller === uid);
        if (angular.isDefined(prevValue)) {
          if (prevValue.offerer !== self.value.offerer) {
            $rootScope.$broadcast(_OFFERER_UPDATED_, {
              data: {
                offerer: self.value.offerer
              }
            });
          }
          if (prevValue.answerer !== self.value.answerer) {
            $rootScope.$broadcast(_ANSWERER_UPDATED_, {
              data: {
                answerer: self.value.answerer
              }
            });
          }
        }
        if (angular.isDefined(self.loadedDeferred)) {
          self.loadedDeferred.resolve(self.value);
          delete self.loadedDeferred;
        }
      });

      return this;
    }

    Call.prototype.onOffererUpdated = function($scope, handler) {
      $scope.$on(_OFFERER_UPDATED_, function(event, args) {
        handler(args.data);
      });
    };

    Call.prototype.onAnswererUpdated = function($scope, handler) {
      $scope.$on(_ANSWERER_UPDATED_, function(event, args) {
        handler(args.data);
      });
    };

    Call.prototype.loaded = function() {
      if (angular.isDefined(this.value)) {
        return $q.when(this.value);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    Call.prototype.destroy = function() {
      this.call.off();
    };

    function updateProperty(call, prop, value) {
      var callId = call.value.id;
      var userData = {};
      userData[firebaseDataService.callsPath + '/' + call.value.caller + '/' + callId + '/' + prop] = value;
      userData[firebaseDataService.callsPath + '/' + call.value.callee + '/' + callId + '/' + prop] = value;
      return firebaseDataService.root.update(userData);
    }

    function updateOfferer(call, register) {
      var value = (register === true) ? call.uid : null;
      return updateProperty(call, 'offerer', value);
    }

    function updateAnswerer(call, register) {
      var value = (register === true) ? call.uid : null;
      return updateProperty(call, 'answerer', value);
    }

    // function localJoined(call, joined) {
    //   if (joined !== true) {
    //     joined = null;
    //   }
    //   var callId = call.value.id;
    //   var userData = {};
    //   if (call.isUserCaller) {
    //     userData[firebaseDataService.callsPath + '/' + call.value.caller + '/' + callId + '/localJoined'] = joined;
    //     userData[firebaseDataService.callsPath + '/' + call.value.callee + '/' + callId + '/remoteJoined'] = joined;
    //   } else {
    //     userData[firebaseDataService.callsPath + '/' + call.value.callee + '/' + callId + '/localJoined'] = joined;
    //     userData[firebaseDataService.callsPath + '/' + call.value.caller + '/' + callId + '/remoteJoined'] = joined;
    //   }
    //   return firebaseDataService.root.update(userData);
    // }
    // function localJoined(call, joined) {
    //   if (joined !== true) {
    //     joined = null;
    //   }
    //   return updateProperty(call, 'localJoined', joined);
    // }

    // function remoteJoined(call, joined) {
    //   if (joined !== true) {
    //     joined = null;
    //   }
    //   return updateProperty(call, 'remoteJoined', joined);
    // }

    // Returns Promise
    Call.prototype.registerOffer = function() {
      return updateOfferer(this, true);
    };

    Call.prototype.unregisterOffer = function() {
      return updateOfferer(this, false);
    };

    Call.prototype.registerAnswer = function() {
      return updateAnswerer(this, true);
    };

    Call.prototype.unregisterAnswer = function() {
      return updateAnswerer(this, false);
    };

    // Call.prototype.makeLocalJoined = function() {
    //   return localJoined(this, true);
    // };

    // Call.prototype.makeRemoteJoined = function() {
    //   return remoteJoined(this, true);
    // };

    // Call.prototype.makeCallerLeft = function() {
    //   return localJoined(this, false);
    // };

    // Call.prototype.makeCalleeLeft = function() {
    //   return remoteJoined(this, false);
    // };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Call);

  };

  callFactory.$inject = ['$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('Call', callFactory);

})();
