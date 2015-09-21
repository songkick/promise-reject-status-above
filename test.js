var tap = require('tap');
var rejectStatusAbove = require('./index');

tap.test('throws when no settings or status specified', function (t) {

    t.plan(2);

    function success() {
        return Promise.resolve('success');
    }

    t.throws(rejectStatusAbove()(success));
    t.throws(rejectStatusAbove({})(success));

});

function createResponse(status) {
    return {
        status
    }
}

tap.test('resolves a Response with status below threshold', function (t) {

    t.plan(1);

    var response = createResponse(399);

    function belowStatus() {
        return Promise.resolve(response);
    }

    rejectStatusAbove({status: 400})(belowStatus)().then(function (result) {
        t.equal(result, response, 'result should be original promise result');
    }).catch(function (err) {
        t.bailout('the promise was unexpectedly rejected');
    });

});

tap.test('rejects a Response with status above threshold', function (t) {

    t.plan(5);

    var response = createResponse(400);

    function aboveStatus() {
        return Promise.resolve(response);
    }

    rejectStatusAbove({status: 400})(aboveStatus)().then(function (res) {
        t.bailout('the promise was unexpectedly resolved');
    }).catch(function (error) {
        t.ok(error instanceof rejectStatusAbove.StatusAboveError, 'error should be instance of StatusAboveError');
        t.equal(error.fn, aboveStatus, 'initial functon was not returned');
        t.equal(error.message, 'Response status above accepted status', 'wrong error message');
        t.equal(error.response, response, 'ititial response was not returned');
        t.equal(error.settings.status, 400, 'settings.status was not returned');
    });

});

tap.test('forward error if promise rejects', function (t) {

    t.plan(1);

    var expectedError = {
        something: 'went wrong'
    };

    function willReject() {
        return Promise.reject(expectedError);
    }

    rejectStatusAbove({status: 400})(willReject)().then(function (res) {
        t.bailout('the promise was unexpectedly resolved');
    }).catch(function (error) {
        t.equal(error, expectedError, 'The promise was not reject with the original error');
    });

});
