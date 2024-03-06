class ApiResponse{
    constructor(statusCode, data, message="success"){
        this.success = statusCode < 400; // success will return true if statuscode is less than 400 only for errors it is 400+
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}

// in above code we are just standardising how we gonna send send response. 

export default ApiResponse;