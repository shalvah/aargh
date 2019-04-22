const makeErrorChecker = (e) => {

    return {
        e: e,

        matched: false,

        result: undefined,

        type(errorTypes, callback) {
            if (this.matched) return this;
            typeof errorTypes === "function" && (errorTypes = [errorTypes]);

            for (let type of errorTypes) {
                if (this.e.constructor.name === type.name) {
                    this.matched = true;
                    this.result = callback ? callback(this.e) : 1;
                    return this;
                }
            }
            return this;
        },

        throw() {
            if (this.matched) return this.result;
            throw this.e;
        }
    }
};

function aargh(e) {
    return makeErrorChecker(e);
}

module.exports = aargh;
