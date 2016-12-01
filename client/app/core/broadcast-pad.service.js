(function() {
  'use strict';

  var broadcastPadFactory = function($rootScope, $q, firebaseDataService) {

    var _SYNCED_ = '_SYNCED_';

    function BroadcastPad(options) {
      if (!(this instanceof BroadcastPad)) {
        var obj = Object.create(BroadcastPad.prototype);
        return BroadcastPad.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var broadcastOwnerId = options.broadcastownerid;
      if (!broadcastOwnerId) {
        throw new Error('broadcast-owner-id missing');
      }
      var broadcastSessionId = options.broadcastsessionid;
      if (!broadcastSessionId) {
        throw new Error('broadcast-session-id missing');
      }
      var padContainer = options.padcontainer;
      if (!padContainer) {
        throw new Error('pad-container missing');
      }

      var self = this;

      this.broadcastPadRef = firebaseDataService.broadcastPads.child(broadcastOwnerId).child(broadcastSessionId);

      //// Create CodeMirror (with lineWrapping on).
      var codeMirror = CodeMirror(padContainer, { lineWrapping: true });

      //// Create Firepad (with rich text toolbar and shortcuts enabled).
      this.broadcastPad = Firepad.fromCodeMirror(this.broadcastPadRef, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true, userId: uid });

      this.broadcastPad.on('ready', function() {
        self.ready = true;
        if (angular.isDefined(self.loadedDeferred)) {
          self.loadedDeferred.resolve(self.ready);
          delete self.loadedDeferred;
        }
      });
      this.broadcastPad.on('synced', function(isSynced) {
        $rootScope.$broadcast(_SYNCED_, {
          data: {
            isSynced: isSynced
          }
        });
      });

      return this;
    }

    BroadcastPad.prototype.onSynced = function($scope, handler) {
      $scope.$on(_SYNCED_, function(event, args) {
        handler(args.data);
      });
    };

    BroadcastPad.prototype.getText = function() {
      return this.broadcastPad.getText();
    };

    BroadcastPad.prototype.setText = function(text) {
      return this.broadcastPad.setText(text);
    };

    BroadcastPad.prototype.getHtml = function() {
      return this.broadcastPad.getHtml();
    };

    BroadcastPad.prototype.setHtml = function(text) {
      return this.broadcastPad.setHtml(text);
    };

    BroadcastPad.prototype.isHistoryEmpty = function() {
      return this.broadcastPad.isHistoryEmpty();
    };

    BroadcastPad.prototype.deleteHistory = function() {
      return this.broadcastPadRef.child('history').remove();
    };

    BroadcastPad.prototype.dispose = function() {
      return this.broadcastPad.dispose();
    };

    BroadcastPad.prototype.destroy = function() {
      this.broadcastPad.off();
    };

    BroadcastPad.prototype.loaded = function() {
      if (angular.isDefined(this.ready)) {
        return $q.when(this.ready);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (BroadcastPad);

  };

  broadcastPadFactory.$inject = ['$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('BroadcastPad', broadcastPadFactory);

})();
