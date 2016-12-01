(function() {
    
  var collectionFactory = function() {

    // The constructor function.
    function Collection() {

      // When creating the collection, we are going to work off
      // the core array. In order to maintain all of the native
      // array features, we need to build off a native array.
      var collection = Object.create(Array.prototype);

      // Initialize the array.
      collection = Array.apply(collection, arguments);

      // Add all the class methods to the collection.
      Collection.injectClassMethods(collection);

      // Return the new collection object.
      return (collection);
    };


    // ------------------------------------------------------ //
    // ------------------------------------------------------ //


    // The "instance" methods using the prototype
    // and standard prototypal inheritance.
    Collection.prototype = {

      // Add the given item to the collection. If the given item
      // is an array, then each item within the array is added
      // individually.
      add: function(value) {

        // Check to see if the item is an array.
        if (Collection.isArray(value)) {

          // Add each item in the array.
          for (var i = 0; i < value.length; i++) {

            // Add the sub-item using the default push() method.
            Array.prototype.push.call(this, value[i]);

          }

        } else {

          // Use the default push() method.
          Array.prototype.push.call(this, value);

        }

        // Return this object reference for method chaining.
        return (this);

      },

      // Add the given item to the collection at the specified
      // position. If the given item is an array, then each item
      // within the array is added individually.
      addAt: function(pos, value) {

        Array.prototype.splice.apply(this, [pos, 0].concat(value));

        // Return this object reference for method chaining.
        return (this);

      },

      // Add all the given items to the collection.
      addAll: function() {

        // Loop over all the arguments to add them to the
        // collection individually.
        for (var i = 0; i < arguments.length; i++) {

          // Add the given value.
          this.add(arguments[i]);

        }

        // Return this object reference for method chaining.
        return (this);

      },

      // Remove the item at the given index from the collection.
      removeAt: function(index) {

        // Check to see if the index is a number.
        if (typeof index === 'number') {

          // Use the default splice() method.
          Array.prototype.splice.call(this, index, 1);

        }

        // Return this object reference for method chaining.
        return (this);

      },

      // // Find the index of the item with the given id in the collection.
      // findIndex2: function(value, prop) {

      //   prop = prop || 'id';

      //   // Use the default findIndex() method.
      //   return Array.prototype.findIndex.call(this, function(element) {
      //     if (element[prop] === value) {
      //       return true;
      //     }
      //   });

      // },

      findIndex: function(callback) {
        return Array.prototype.findIndex.call(this, function(element, index, array) {
          return callback(element, index, array);
        });
      },

      find: function(callback) {
        return Array.prototype.find.call(this, function(element, index, array) {
          return callback(element, index, array);
        });
      },

      map: function(callback) {
        return Array.prototype.map.call(this, function(currentValue, index, array) {
          return callback(currentValue, index, array);
        });
      },

      mapRight: function(callback) {
        var n = this.length;
        if (n > 0) {
          var arr = [];
          for (var i = n - 1; i >= 0; i--) {
            arr[i] = callback(this[i], i, this);
          }
          return arr;
        }
      },

      slice: function() {
        return Array.prototype.slice.call(this, arguments);
      },

      filter: function(callback) {
        return Array.prototype.filter.call(this, function(value, index, array) {
          return callback(value, index, array);
        });
      }

    };


    // ------------------------------------------------------ //
    // ------------------------------------------------------ //


    // The "class" / "static" methods. These are
    // utility methods on the class itself; they do not
    // have access to the "this" reference.

    Collection.injectClassMethods = function(collection) {

      // Loop over all the prototype methods and add them
      // to the new collection.
      for (var method in Collection.prototype) {

        // Make sure this is a local method.
        if (Collection.prototype.hasOwnProperty(method)) {

          // Add the method to the collection.
          collection[method] = Collection.prototype[method];

        }

      }

      // Return the updated collection.
      return (collection);

    };

    // Create a new collection from the given array.
    Collection.fromArray = function(array) {

      // Create a new collection.
      var collection = Collection.apply(null, array);

      // Return the new collection.
      return (collection);

    };

    // Determine if the given object is an array.
    Collection.isArray = function(value) {

      // Get its stringified version.
      var stringValue = Object.prototype.toString.call(value);

      // Check to see if the string representation denotes array.
      return (stringValue.toLowerCase() === '[object array]');

    };

    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return (Collection);

  };
  
  collectionFactory.$inject = [];

  angular.module('livewatchApp.core').factory('Collection', collectionFactory);

}());
