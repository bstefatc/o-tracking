/*global require, describe, it, beforeEach, afterEach */
var assert = require('assert'),
    Store = require("../../src/javascript/core/store"),
    User = require("../../src/javascript/core/user");

describe('Core.User', function () {
    "use strict";

    var userID;

    beforeEach(function () {
        (new Store('userID')).destroy();
    });
    afterEach(function () {
        (new Store('userID')).destroy();
    });

    describe('no preset value', function () {
        it('should init', function () {
            assert.doesNotThrow(function () {
                userID = User.init();
            });
        });

        it('should use generate an ID if one does not exist', function () {
            assert.equal(User.userID(), userID);
        });
    });

    describe('use init with an existing value', function () {
        it('should use an object', function () {
            User.init({
                value: 'value1'
            });
        });

        it('should retrieve the userID ', function () {
            assert.equal(User.userID(), 'value1');
        });

        it('should use a string', function () {
            User.init('value2');
        });

        it('should retrieve the userID ', function () {
            assert.equal(User.userID(), 'value2');
        });
    });

    describe('retrieving values.', function () {
        it('should use the existing value, even if a new one is provided.', function () {
            User.init('value2');
            User.init('value3');
            assert.equal(User.userID(), 'value2');
        });
    });

});
