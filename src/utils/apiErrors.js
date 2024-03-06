class ApiErrors extends Error{
    constructor(statusCode, message = "Something went wrong", errors = [], stack=""){
        super(message); // taking message to rewrite original
        this.message = message; // rewriting message
        this.data = null; // data will be null as we are only gonna need to handle error
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

// in the above class we are inhereting existing error class and chaning some parameters of it, according to our project

export default ApiErrors;