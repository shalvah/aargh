const tap = require('tap');
const aargh = require('../dist/index.js');

class NumberTwoError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class NumberThreeError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class NumberFourError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class NumberFiveError extends Error {
    constructor(...args) {
        super(...args);
    }
}

class NumberSixError extends Error {
    constructor(...args) {
        super(...args);
    }
}



class SubclassNumberFourError extends NumberFourError {
    constructor(...args) {
        super(...args);
    }
}

function functionThatThrowsErrors (a) {
    switch (a) {
        case 0:
            return true;
        case 1:
            throw new Error('1 passed');
        case 2:
            throw new NumberTwoError('2 passed');
        case 3:
            throw new NumberThreeError('3 passed');
        case 4:
            throw new NumberFourError('4 passed');
        case 5:
            throw new SubclassNumberFourError('5 passed');
        case 6:
            throw new NumberSixError('6 passed');
        default:
            throw new TypeError('Aaargh');
    }
}

const errorMapping = {
    '0': true,
    '1': Error,
    '2': NumberTwoError,
    '3': NumberThreeError,
    '4': NumberFiveError,
    '5': SubclassNumberFourError,
    '6': NumberSixError,
}

function scenario (a) {
    try {
        return functionThatThrowsErrors(a);
    } catch(e) {
        return aargh(e)
            .type(NumberTwoError, (e) => 'Caught ' + e.constructor.name)
            .type([NumberThreeError, NumberFourError], (e) => 'Caught ' + e.constructor.name)
            .handle(NumberSixError, (e) => `Caught ${e.constructor.name}`)
            .throw();
    }
}

// Catches/passes on errors selectively and returns specified return value
tap.equal(scenario(0), true);
tap.equal(scenario(2), 'Caught NumberTwoError');
tap.equal(scenario(3), 'Caught NumberThreeError');
tap.equal(scenario(4), 'Caught NumberFourError');
tap.equal(scenario(6), 'Caught NumberSixError');
tap.throws(() => scenario(1000), TypeError);

// Works with Promises

const asyncFunctionThatThrowsErrors = (a) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            switch (a) {
                case 0:
                    return resolve(true);
                case 1:
                    return reject(new Error('1 passed'));
                case 2:
                    return reject(new NumberTwoError('2 passed'));
                case 3:
                    return reject(new NumberThreeError('3 passed'));
                case 4:
                    return reject(new NumberFourError('4 passed'));
                case 5:
                    return reject(new NumberFiveError('5 passed'));
                default:
                    return reject(new TypeError('Aaargh'));
            }
        }, 2000);
    });
};

function promiseScenario (a) {
    return asyncFunctionThatThrowsErrors(a)
            .catch(e => {
                return aargh(e)
                    .type(NumberTwoError, (e) => 'Caught ' + e.constructor.name)
                    .type([NumberThreeError, NumberFourError], (e) => 'Caught ' + e.constructor.name)
                    .handle(NumberFiveError, (e) => `Caught ${e.constructor.name}`)
                    .throw();
            });
}

promiseScenario(0).then(r => tap.equal(r, true));
promiseScenario(2).then(r => tap.equal(r, 'Caught NumberTwoError'));
promiseScenario(3).then(r => tap.equal(r, 'Caught NumberThreeError'));
promiseScenario(4).then(r => tap.equal(r, 'Caught NumberFourError'));
promiseScenario(5).then(r => tap.equal(r, 'Caught NumberFiveError'));
tap.rejects(() => promiseScenario(7), TypeError);


// What happens if error is thrown while executing a handler

function ohNoScenario (a) {
    try {
        return functionThatThrowsErrors(a);
    } catch(e) {
        return aargh(e)
            .type(errorMapping[String(a)], (e) => {
                throw new errorMapping[String(a)]('Oh no!');
            })
            .throw();
    }
}

function ohNoScenarioWithCatch (a) {
    try {
        return functionThatThrowsErrors(a);
    } catch(e) {
        return aargh(e)
            .handle(errorMapping[String(a)], (e) => {
                throw new errorMapping[String(a)]('Oh no!');
            })
            .throw();
    }
}

tap.throws(() => ohNoScenario(2), NumberTwoError);
tap.throws(() => ohNoScenarioWithCatch(2), NumberTwoError);

// Catch-all handler

function catchAllScenario (a) {
    try {
        return functionThatThrowsErrors(a);
    } catch(e) {
        return aargh(e)
            .type(NumberTwoError, (e) => 'Caught ' + e.constructor.name)
            .others((e) => 'Caught ' + e.constructor.name + ' with others');
    }
}

tap.equal(catchAllScenario(1), 'Caught Error with others');
tap.equal(catchAllScenario(2), 'Caught NumberTwoError');
tap.equal(catchAllScenario(3), 'Caught NumberThreeError with others');

// handles subclasses
function subclassScenario (a) {
    try {
        return functionThatThrowsErrors(a);
    } catch(e) {
        return aargh(e)
            .type(NumberFourError, (e) => 'Caught ' + e.constructor.name)
            .others((e) => 'Caught ' + e.constructor.name + ' with others');
    }
}
tap.equal(subclassScenario(5), 'Caught SubclassNumberFourError');