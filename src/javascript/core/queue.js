/**
 * Class for handling a queue backed up by a store.
 * @module _Core
 * @submodule Queue
 * @class Queue
 * @param name {String} The name of the queue.
 * @constructor
 */

/*global module, require */
module.exports = (function () {
    "use strict";

    var utils = require("../utils"),
        Store = require("./store"),

        Queue = function (name) {
            if (utils.isUndefined(name)) {
                throw new Error('You must specify a name for the queue.');
            }

            /**
             * Queue data.
             * @property queue
             * @private
             */
            this.queue = [];

            /**
             * The storage method to use. Determines best storage method.
             * @property storage
             * @type {Object}
             * @private
             */
            this.storage = new Store(name);

            // Retrieve any previous store with the same name.
            if (this.storage.read()) {
                this.queue = this.storage.read();
            }

            return this;
        };

    /**
     * Gets the contents of the store.
     * @method all
     * @return {Array} The array of items.
     */
    Queue.prototype.all = function () {
        if (this.queue.length === 0) {
            return null;
        }

        var items = [],
            i;

        for (i = 0; i < this.queue.length; i = i + 1) {
            items.push(this.queue[i].item);
        }

        return items;
    };

    /**
     * Gets the first item in the store.
     * @method first
     * @return {*} Returns the item.
     */
    Queue.prototype.first = function () {
        if (this.queue.length === 0) {
            return null;
        }

        return this.queue[0].item;
    };

    /**
     * Gets the last item in the store.
     * @method last
     * @return {*} Returns the item.
     */
    Queue.prototype.last = function () {
        if (this.queue.length === 0) {
            return null;
        }

        return this.queue.slice(-1)[0].item;
    };

    Queue.prototype.id = function () {
        return (Math.random() * 10000) + "." + (new Date()).getTime();
    };

    /**
     * Add data to the store.
     * @method add
     * @param item {*} An item or an array of items.
     * @return Returns this.
     * @chainable
     */
    Queue.prototype.add = function (item) {
        // I was trying to turn this whole add function into a little module, to stop doAdd function being created everytime, but couldn't work out how to get to "this" from within the module.

        var self = this,
            i;

        function doAdd(item) {
            self.queue.push({
                created_at: (new Date()).valueOf(),
                id: self.id(),
                item: item
            });
        }

        if (utils.is(item, 'object') && item.constructor.toString().match(/array/i)) {
            for (i = 0; i < item.length; i = i + 1) {
                doAdd(item[i]);
            }
        } else {
            doAdd(item);
        }

        return self;
    };

    /**
     * Overwrite the store with something completely new.
     * @method replace
     * @param items {Array} The new array of data.
     * @return Returns this.
     * @chainable
     */
    Queue.prototype.replace = function (items) {
        if (utils.is(items, 'object') && items.constructor.toString().match(/array/i)) {
            this.queue = [];
            this.add(items).save();

            return this;
        }

        throw new Error('Argument invalid, must be an array.');
    };

    /**
     * Pop the first item from the queue.
     * @method shift
     * @return {*} The item.
     */
    Queue.prototype.shift = function () {
        var replacement = this.all(),
            nextItem = this.first(),
            i;

        if (!nextItem) {
            return null;
        }

        for (i = 0; i < replacement.length; i = i + 1) {
            if (nextItem.requestID === replacement[i].requestID) {
                replacement.splice(i, 1);
                this.replace(replacement).save();
                break;
            }
        }

        return nextItem;
    };

    /**
     * Save the current store to localStorage so that old requests can still be sent after a page refresh.
     * @method save
     * @return Returns this.
     * @chainable
     */
    Queue.prototype.save = function () {
        this.storage.write(this.queue);

        return this;
    };

    return Queue;
}());

