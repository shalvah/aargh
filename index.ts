'use strict';



const makeErrorChecker = (e: object) => {
    type T = typeof e;

    let errorHandler = Symbol('errorHandler')

    return {
        e: e,

        [errorHandler]( errorType: Function | Function[], callback: (error: T) => any){
            
            if (this.matched) return this;
            const errorTypes : Function[] = typeof errorType === "function" ? [errorType] : errorType;

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

        type(errorType: Function | Function[], callback: (error: T) => any) {
            return this[errorHandler](errorType, callback);
        },

        catch(errorType: Function | Function[], callback: (error: T) => any){
            return this[errorHandler](errorType, callback);
        },

        throw() {
            if (this.matched) return this.result;
            throw this.e;
        },

        others(callback: (error: T) => any) {
            if (this.matched) return this.result;
            this.result = callback ? callback(this.e) : undefined;
            return this.result;
        }
    }
};

export = makeErrorChecker;
