(function() {
  'use strict';

  var sharePadFactory = function($rootScope, $q, firebaseDataService) {

    var _SYNCED_ = '_SYNCED_';

    function SharePad(options) {
      if (!(this instanceof SharePad)) {
        var obj = Object.create(SharePad.prototype);
        return SharePad.apply(obj, arguments);
      }

      options = options || {};
      var uid = options.uid;
      if (!uid) {
        throw new Error('uid missing');
      }
      var ownerId = options.ownerid;
      if (!ownerId) {
        throw new Error('owner-id missing');
      }
      var callId = options.callid;
      if (!callId) {
        throw new Error('call-id missing');
      }
      var padContainer = options.padcontainer;
      if (!padContainer) {
        throw new Error('pad-container missing');
      }

      var self = this;

      this.sharePadRef = firebaseDataService.sharePads.child(ownerId).child(callId);

      //// Create CodeMirror (with lineWrapping on).
      var codeMirror = CodeMirror(padContainer, { lineWrapping: true });

      //// Create Firepad (with rich text toolbar and shortcuts enabled).
      this.sharePad = Firepad.fromCodeMirror(this.sharePadRef, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true, userId: uid });

      this.sharePad.on('ready', function() {
        self.ready = true;
        if (angular.isDefined(self.loadedDeferred)) {
          self.loadedDeferred.resolve(self.ready);
          delete self.loadedDeferred;
        }
      });
      this.sharePad.on('synced', function(isSynced) {
        $rootScope.$broadcast(_SYNCED_, {
          data: {
            isSynced: isSynced
          }
        });
      });

      return this;
    }

    SharePad.prototype.onSynced = function($scope, handler) {
      $scope.$on(_SYNCED_, function(event, args) {
        handler(args.data);
      });
    };

    SharePad.prototype.getText = function() {
      return this.sharePad.getText();
    };

    SharePad.prototype.setText = function(text) {
      return this.sharePad.setText(text);
    };

    SharePad.prototype.getHtml = function() {
      return this.sharePad.getHtml();
    };

    SharePad.prototype.setHtml = function(text) {
      return this.sharePad.setHtml(text);
    };

    SharePad.prototype.isHistoryEmpty = function() {
      return this.sharePad.isHistoryEmpty();
    };

    // SharePad.prototype.deleteHistory = function() {
    //   return this.sharePadRef.child('history').remove();
    // };

    SharePad.prototype.dispose = function() {
      return this.sharePad.dispose();
    };

    SharePad.prototype.destroy = function() {
      this.sharePad.off();
    };

    SharePad.prototype.loaded = function() {
      if (angular.isDefined(this.ready)) {
        return $q.when(this.ready);
      }
      this.loadedDeferred = $q.defer();
      return this.loadedDeferred.promise;
    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (SharePad);

  };

  sharePadFactory.$inject = ['$rootScope', '$q', 'firebaseDataService'];
  
  angular
    .module('livewatchApp.core')
    .factory('SharePad', sharePadFactory);

})();
