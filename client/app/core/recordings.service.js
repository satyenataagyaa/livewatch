(function() {
  'use strict';

  var recordingsFactory = function(Collection, $rootScope, $q, firebaseDataService) {

    var _RECORDING_ADDED_ = '_RECORDING_ADDED_';
    var _RECORDING_REMOVED_ = '_RECORDING_REMOVED_';
    var _RECORDING_CHANGED_ = '_RECORDING_CHANGED_';

    function Recordings(options) {
      if (!(this instanceof Recordings)) {
        var obj = Object.create(Recordings.prototype);
        return Recordings.apply(obj, arguments);
      }

      options = options || {};
      var callId = options.callid;
      if (!callId) {
        throw new Error('call-id missing');
      }

      Collection.apply(this);

      var self = this;

      this.recordings = firebaseDataService.recordings.child(callId);

      this.recordings.on('child_added', function(snapshot, prevChildKey) {
        var recording = snapshot.val();
        recording.id = snapshot.key;
        self.add(recording);
        $rootScope.$broadcast(_RECORDING_ADDED_, {
          data: {
            recording: recording,
            index: self.length - 1
          }
        });
      });
      this.recordings.on('child_removed', function(prevSnapshot) {
        var recording = prevSnapshot.val();
        recording.id = prevSnapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === recording.id;
        });
        if (index > -1) {
          self.removeAt(index);
          $rootScope.$broadcast(_RECORDING_REMOVED_, {
            data: {
              recording: recording,
              index: index
            }
          });
        }
      });
      this.recordings.on('child_changed', function(snapshot, prevChildKey) {
        var recording = snapshot.val();
        recording.id = snapshot.key;
        var index = self.findIndex(function(element) {
          return element.id === recording.id;
        });
        if (index > -1) {
          var oldRecording = self[index];
          self[index] = recording;
          $rootScope.$broadcast(_RECORDING_CHANGED_, {
            data: {
              newRecording: recording,
              oldRecording: oldRecording,
              index: index
            }
          });
        }
      });

      return this;
    }

    Recordings.prototype = Object.create(Collection.prototype);
    Recordings.prototype.constructor = Recordings;

    Recordings.prototype.onRecordingAdded = function($scope, handler) {
      $scope.$on(_RECORDING_ADDED_, function(event, args) {
        handler(args.data);
      });
    };

    Recordings.prototype.onRecordingRemoved = function($scope, handler) {
      $scope.$on(_RECORDING_REMOVED_, function(event, args) {
        handler(args.data);
      });
    };

    Recordings.prototype.onRecordingChanged = function($scope, handler) {
      $scope.$on(_RECORDING_CHANGED_, function(event, args) {
        handler(args.data);
      });
    };

    Recordings.prototype.destroy = function() {
      this.recordings.off();
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Recordings);

  };

  recordingsFactory.$inject = ['Collection', '$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('Recordings', recordingsFactory);

})();