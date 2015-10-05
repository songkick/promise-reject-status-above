# promise-reject-status-above [![Build Status](https://travis-ci.org/songkick/promise-reject-status-above.svg)](https://travis-ci.org/songkick/promise-promise-reject-status-above) [![Code Climate](https://codeclimate.com/github/songkick/promise-reject-status-above/badges/gpa.svg)](https://codeclimate.com/github/songkick/promise-reject-status-above) [![Test Coverage](https://codeclimate.com/github/songkick/promise-reject-status-above/badges/coverage.svg)](https://codeclimate.com/github/songkick/promise-reject-status-above/coverage)

Rejects a promise returned by `fetch()` if status above threshold

```js
var rejectStatusAbove = require('promise-reject-status-above');
var rejectAbove400 = rejectStatusAbove({status: 400});

function fetch200(){
    return fetch('/path/to/a/http-200-ok');
}

function fetch400(){
    return fetch('/path/to/a/http-400-bad-request');
}

rejectAbove400(fetch200)()
  .then(function(response){
    // the initial fetch response
  }).catch(function(err){
    // probably won't happen here, unless /200 doesn't return a HTTP - 200
  });

rejectAbove400(fetch400)()
  .then(function(response){
    // should not happen here
  }).catch(function(err){
      // err instanceof rejectStatusAbove.StatusAboveError === true
      // err === {
      //   message: 'Response status above accepted status',
      //   settings: {
      //     status: 400,
      //   },
      //   fn: fetch400,
      //   response: window.Response // the original fetch Response
      // }
  });
```

## Options

`status`: positive (>= 0) number. The returned promise will be rejected if the
response's status is equal or above this number.

## Composition

As `promise-reject-status-above` input and output is a function returning a promise, you can compose them easily with other simial helpers ([see below](#see-also)).

In the example below, our `/data` API is a bit janky and might return HTTP 500 errors. We'll retry them twice before giving up.

```js
var promiseRetry = require('promise-retry');
var rejectStatusAbove = require('promise-reject-status-above');

var retryTwice = promiseRetry({ retries: 2 });
var rejectAbove500 = rejectStatusAbove({status: 500});

function fetchData() {
    // this call might return 500 sometimes
    return fetch('/data');
}

retryTwice(rejectAbove500(fetchData))().then(function(response){
  // yay !
}).catch(function(err){
  // we retried the call twice but always got 500s :(
});
```

# See also

`promise-reject-status-above` composes really well with the following promise helper:

* [`promise-retry`](https://github.com/songkick/promise-retry)
* [`promise-timeout`](https://github.com/songkick/promise-timeout)
