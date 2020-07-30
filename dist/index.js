'use strict';
const makeErrorChecker = (e) => {
    let errorHandler = Symbol('errorHandler');
    return {
        e: e,
        [errorHandler](errorType, callback) {
            if (this.matched)
                return this;
            const errorTypes = typeof errorType === "function" ? [errorType] : errorType;
            for (let type of errorTypes) {
                if (this.e.constructor.name === type.name || this.e instanceof type) {
                    this.matched = true;
                    this.result = callback ? callback(this.e) : undefined;
                    return this;
                }
            }
            return this;
        },
        matched: false,
        result: undefined,
        type(errorType, callback) {
            return this[errorHandler](errorType, callback);
        },
        handle(errorType, callback) {
            return this[errorHandler](errorType, callback);
        },
        throw() {
            if (this.matched)
                return this.result;
            throw this.e;
        },
        others(callback) {
            if (this.matched)
                return this.result;
            this.result = callback ? callback(this.e) : undefined;
            return this.result;
        }
    };
};
module.exports = makeErrorChecker;
