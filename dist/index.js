'use strict';
const makeErrorChecker = (e) => {
    return {
        e: e,
        matched: false,
        result: undefined,
        type(errorType, callback) {
            if (this.matched)
                return this;
            const errorTypes = typeof errorType === "function" ? [errorType] : errorType;
            for (let type of errorTypes) {
                if (this.e.constructor.name === type.name) {
                    this.matched = true;
                    this.result = callback ? callback(this.e) : undefined;
                    return this;
                }
            }
            return this;
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
module.exports = function (e) {
    return makeErrorChecker(e);
};
