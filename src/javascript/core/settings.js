/**
 * Settings store.
 * @module Track
 * @class Settings
 */

/*global module */
var settings = {
    'internalCounter': 0
};

module.exports = (function () {
    "use strict";

    function setValue(name, value) {
        settings[name] = value;
    }

    function getValue(name) {
        return settings[name];
    }

    function deleteValue(name) {
        delete settings[name];
    }

    return {
        'set': setValue,
        'get': getValue,
        'delete': deleteValue
    };

}());