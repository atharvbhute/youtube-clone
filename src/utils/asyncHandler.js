/**
 * Wraps an asynchronous route handler or middleware to catch any unhandled errors and pass them to the next middleware in the chain.
 * 
 * @param {Function} requestHandler - The asynchronous route handler or middleware function to wrap. This function can take three arguments: req, res, and next, representing the request object, response object, and next middleware function in the Express.js route chain.
 * @returns {Function} A function that takes three arguments (req, res, next) and returns a Promise that resolves to the result of the requestHandler. If the promise is rejected, the error is caught and passed to the next middleware function.
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
};

// here used higer order function to return a function with the promise. 

export default asyncHandler;
