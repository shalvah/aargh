# aargh
Yep. That's the sound of a man who just got dumped by his girlfriend, chewed by a bear and then shot 32 times. It's also the sound I make when working with JavaScript.

Lol, just kidding. It's *one* of the sounds I make when working with JavaScript. Aaaaaaargh.

[![npm version](https://badge.fury.io/js/aargh.svg)](https://badge.fury.io/js/aargh)
[![Build Status](https://travis-ci.com/shalvah/aargh.svg?branch=master)](https://travis-ci.com/shalvah/aargh)

## Why, what, who is this?
This module gives you a simple way to selectively handle errors in JavaScript.

Supposing you have a function like this:

```javascript
function fetchTweets (userId) {
    return twitterApi.fetch(userIdd).then(response => {
        if (response.error && response.error.message.includes("Too many requests")) {
            throw new RateLimitExceededError();
        }
        return response.data;
    })
}
```

This function is meant to throw a specific error when you exceed your Twitter API rate limits.

So you call it like this:

```javascript
fetchTweets(userId)
  .catch(e => {
      console.log('Rate limit exceeded; initiating exponential backoff');
      // do backoff
  })
  .then(tweets => {
      // do stuff with them
  })
```

or...

```javascript
try {
    let tweets = await fetchTweets(userId);
} catch(e) {
      console.log('Rate limit exceeded; initiating exponential backoff');
      // do backoff
}
```

See the problem? Different errors could be thrown in that function. For instance, if you look closely at the function, you'll see I made a typo on the first line (`userIdd` instead of `userId`) which will throw a `ReferenceError` when executed. However, the calling code will expect a `RateLimitError` only.

There's a simple fix: use an if-statement:
```javascript
try {
    let tweets = await fetchTweets(userId);
} catch(e) {
    if (e instanceof RateLimitExceededError) {
      console.log('Rate limit exceeded; initiating exponential backoff');
      // do backoff
    } else if (e instanceof SomeOtherError || e instanceof SomeOtherAnnoyingError) {
        // handle it
    } else {
        // this is important, so unexpected errors 
        // don't get swallowed by our app
        throw e;
    }
}
```
 
Hey, if that works for you, well, good, but if you're like me, you hate writing this kind of `if` statement. Too messy. I prefer PHP's inbuilt selective error handling:

```php
try {
    $tweets = fetchTweets($userId);
} catch(RateLimitExceededError $e) {
    echo 'Rate limit exceeded; initiating exponential backoff';
     // do backoff
} catch (SomeOtherError | SomeOtherAnnoyingError $e) {
    // handle it
}

// Any error that doesn't match the types you specified is not caught
```
So I decided to do something similar for JS. Here's how you use it:

```javascript
try {
    let tweets = await fetchTweets(userId);
} catch(e) {
    return aargh(e)
        .type(RateLimitExceededError, (e) => {
            console.log('Rate limit exceeded; initiating exponential backoff');
            // do backoff
        })
        .type([SomeOtherError, SomeOtherAnnoyingError], (e) => {
            // handle it
        })
        .throw();
}
```

Works with Promise#catch() too:

```javascript
fetchTweets(userId)
  .catch(e => {
      return aargh(e)
          .type(RateLimitExceededError, (e) =>  {
              console.log('Rate limit exceeded; initiating exponential backoff');
              // do backoff
          })
          .type([SomeOtherError, SomeOtherAnnoyingError], (e) => {
              // handle it
          })
          .throw();
  })
  .then(tweets => {
      // do stuff with them
  })
```

## Usage
```javascript
const aargh = require('aargh');
```
### aargh(e)

The entry point. You pass in the error object you want to handle. You should probably have this as the first statement in all your catch() blocks.

### .type(errorTypes, callback)
The first argument to the `type` function is the type or types (as an array) of errors you want to handle. The second is a callback containing the code you want to execute for that error. Aargh will call this callback with the error as the only parameter. 

You can return stuff from this callback too. Aargh will return this value to the caller.

### .throw()
Calling the `throw()` function ends the chain and ensures any errors which weren't matched by your `type()` checks are thrown back to the caller.

### .others(callback)
Use the `others()` function to end the chain and specify a callback to be executed if the error wasn't matched by your `type()` checks. You should use either `throw()` or `others()`, and it should only be used after all `type()` calls.

```javascript
try {
    return fetchTweets(userId);
} catch(e) {
    return aargh(e)
        .type(RateLimitExceededError, (e) => {
            // do backoff
        })
        .others((e) => {
            // This will catch any other errors
            // Maybe log the error? Idk
        });
}
```
## Want to try it out?

```npm i aargh```

## Hey, I'd like your opinion
I spent time thinking about the most intuitive/natural syntax/flow to use for this. If you're interested in this package, and you've got ideas, please hit me up [on Twitter](twitter.com/theshalvah) or open an issue.

## Don't forget
A few tips for error handling in JS (whether you're using this package or if-statements):
- Create your custom errors. Don't throw strings or just `Error`. **Why?** So you can trace exactly what went wrong i your code.
- Make sure your errors extend from the `Error` class. **Why?** So you can leverage all the awesome debugging tools out there, plus inbuilt Error properties like `.stack`.
- Handle only errors you expect. Let the rest crash your app. **Why?** So you know when something goes wrong.
