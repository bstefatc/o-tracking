/**
 * Class for storing data
 * Will choose the "best" storage method available. Can also specify a type of storage.
 * @module _Core
 * @submodule Store
 * @class Track._Core.Store
 * @param name {String} The name of the store.
 * @param [config] {Object} Optional config object for extra configuration.
 * @constructor
 */
/*global module, require, window */
module.exports = (function () {
    "use strict";

    var Store = function (name, config) {

        var
            /**
             * Internal Storage key prefix.
             * @property keyPrefix
             * @final
             * @private
             */
            keyPrefix = "o-tracking",

            /**
             * Temporary var containing data from a previously saved store.
             * @property loadStore
             * @private
             */
            loadStore,

            utils = require("../utils");

        if (utils.isUndefined(name)) {
            throw new Error('You must specify a name for the store.');
        }

        this.config = utils.merge({ storage: 'best', expires: (10 * 365) }, config);

        /**
         * Store data.
         * @property store
         * @private
         */
        this.data = null;

        /**
         * The key/name of this store.
         * @property storageKey
         */
        this.storageKey = (this.config.hasOwnProperty('nameOverride') ? this.config.nameOverride : [keyPrefix, name].join('_'));

        /**
         * The storage method to use. Determines best storage method.
         * @property storage
         * @type {Object}
         */
        this.storage = (function (config, window) {
            var test_key = keyPrefix + '_InternalTest';

            // If cookie has been manually specified, don't bother with local storage.
            if (config.storage !== 'cookie') {
                try {
                    if (window.localStorage) {
                        window.localStorage.setItem(test_key, 'TEST');

                        if (window.localStorage.getItem(test_key) === 'TEST') {
                            window.localStorage.removeItem(test_key);

                            return {
                                _type: 'localStorage',
                                load: function (name) { return window.localStorage.getItem.call(window.localStorage, name); },
                                save: function (name, value) { return window.localStorage.setItem.call(window.localStorage, name, value); },
                                remove: function (name) { return window.localStorage.removeItem.call(window.localStorage, name); }
                            };
                        }
                    }
                } catch (error) {
                }
            }

            function cookieLoad(name) {
                name = name + "=";

                var cookies = window.document.cookie.split(';'),
                    i,
                    cookie;

                for (i = 0; i < cookies.length; i = i + 1) {
                    cookie = cookies[i].replace(/^\s+|\s+$/g, '');
                    if (cookie.indexOf(name) === 0) {
                        return cookie.substring(name.length, cookie.length);
                    }
                }

                return null;
            }

            function cookieSave(name, value, expiry) {
                var d,
                    expires = '',
                    cookie;

                if (utils.is(expiry, 'number')) {
                    d = new Date();
                    d.setTime(d.getTime() + (expiry * 24 * 60 * 60 * 1000));
                    expires = "expires=" + d.toGMTString() + ';';
                }

                cookie = utils.encode(name) + '=' + utils.encode(value) + ";" + expires + 'path=/;';
                window.document.cookie = cookie;
            }

            function cookieRemove(name) {
                cookieSave(name, '', -1);
            }

            cookieSave(test_key, "TEST");

            if (cookieLoad(test_key) === 'TEST') {
                cookieRemove(test_key);

                return {
                    _type: 'cookie',
                    load: cookieLoad,
                    save: cookieSave,
                    remove: cookieRemove
                };
            }

            return {
                _type: 'none',
                load: function () {},
                save: function () {},
                remove: function () {}
            };
        }(this.config, window));

        // Retrieve any previous store with the same name.
        loadStore = this.storage.load(this.storageKey);
        if (loadStore) {
            try {
                this.data = JSON.parse(loadStore);
            } catch (error) {
                this.data = loadStore;
            }
        }

        return this;
    };

    /**
     * Get/Read the current data.
     * @method read
     * @return Returns the data from the store.
     */
    Store.prototype.read = function () {
        return this.data;
    };

    /**
     * Write the supplied data to the store.
     * @method write
     * @param data {String} The data to write.
     * @return Returns this.
     * @chainable
     */
    Store.prototype.write = function (data) {
        // Set this.data, in-case we're on a file:// domain and can't set cookies.
        this.data = data;
        this.storage.save(this.storageKey, (typeof this.data === 'string' ? this.data : JSON.stringify(this.data)), this.config.expires);

        return this;
    };

    /**
     * Delete the current data.
     * @method destroy
     * @return Returns this.
     * @chainable
     */
    Store.prototype.destroy = function () {
        this.data = null;
        this.storage.remove(this.storageKey);
        return this;
    };

    return Store;
}());
