const tap = require('tap');
const aargh = require('../dist/index.js');

class MyError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class AnotherError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class YetAnotherError extends Error {
    constructor(...args) {
        super(...args);
    }
}

function functionThatCanThrowDifferentErrors (a) {
    switch (a) {
        case 0:
            return true;
        case 1:
            throw new Error('1 passed');
        case 2:
            throw new MyError('2 passed');
        case 3:
            throw new AnotherError('3 passed');
        case 4:
            throw new YetAnotherError('4 passed');
        default:
            throw new TypeError('Aaargh');
    }
}

function scenario (a) {
    try {
        x = functionThatCanThrowDifferentErrors(a);
        return x;
    } catch(e) {
        return aargh(e)
            .type(MyError, (e) => 'Caught ' + e.constructor.name)
            .type([AnotherError, YetAnotherError], (e) => 'Caught ' + e.constructor.name)
            .throw();
    }
}

// Catches/passes on errors selectively and returns specified return value
tap.equal(scenario(0), true);
tap.equal(scenario(2), 'Caught MyError');
tap.equal(scenario(3), 'Caught AnotherError');
tap.equal(scenario(4), 'Caught YetAnotherError');
tap.throws(() => scenario(5), TypeError);

// Works with Promises

const functionThatCanThrowDifferentErrorsAsPromise = (a) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            switch (a) {
                case 0:
                    return resolve(true);
                case 1:
                    return reject(new Error('1 passed'));
                case 2:
                    return reject(new MyError('2 passed'));
                case 3:
                    return reject(new AnotherError('3 passed'));
                case 4:
                    return reject(new YetAnotherError('4 passed'));
                default:
                    return reject(new TypeError('Aaargh'));
            }
        }, 2000);
    });
};

function promiseScenario (a) {
    return functionThatCanThrowDifferentErrorsAsPromise(a)
            .catch(e => {
                return aargh(e)
                    .type(MyError, (e) => 'Caught ' + e.constructor.name)
                    .type([AnotherError, YetAnotherError], (e) => 'Caught ' + e.constructor.name)
                    .throw();
            });
}

promiseScenario(0).then(r => tap.equal(r, true));
promiseScenario(2).then(r => tap.equal(r, 'Caught MyError'));
promiseScenario(3).then(r => tap.equal(r, 'Caught AnotherError'));
promiseScenario(4).then(r => tap.equal(r, 'Caught YetAnotherError'));
tap.rejects(() => promiseScenario(5), TypeError);


// What happens if error is thrown while executing a handler

function ohNoScenario (a) {
    try {
        return functionThatCanThrowDifferentErrors(a);
    } catch(e) {
        return aargh(e)
            .type(MyError, (e) => {
                throw new AnotherError('Oh no!');
            })
            .throw();
    }
}
tap.throws(() => ohNoScenario(2), AnotherError);
