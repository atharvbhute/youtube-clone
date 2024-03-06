const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
};

// here used higer order function to return a function with the promise. 

export default asyncHandler;
