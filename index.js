var factory = function (createExecutor) {
    return function (settings) {
        return function (fn) {
            return function () {
                return new Promise(createExecutor(fn, settings));
            };
        };
    }
};

var rejectStatusAbove = factory(function (fn, settings) {
    if (!settings || typeof settings.status !== 'number') {
        throw new Error("settings.status must be a number");
    }

    function executor(resolve, reject) {

        return fn()
            .then(function(response){
                if (response.status < settings.status) {
                    resolve(response);
                    return;
                }
                reject(new StatusAboveError(settings, fn, response));
            });
    }

    return executor;
});

var StatusAboveError = function (settings, fn, response) {
    this.message = 'Response status above accepted status';
    this.settings = settings;
    this.fn = fn;
    this.response = response;
};
StatusAboveError.prototype = Object.create(Error.prototype);

rejectStatusAbove.StatusAboveError = StatusAboveError;

module.exports = rejectStatusAbove;
