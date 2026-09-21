import { HTTPSTATUS, type HttpStatusCodeType } from "../config/http.config.js";
import { ErrorCodeEnum, type ErrorCodeEnumType } from "../enums/error_code.enum.js";

export class AppError extends Error{

    public statusCode : HttpStatusCodeType; 
    // allow explicit `undefined` to satisfy exactOptionalPropertyTypes
    public errorCode: ErrorCodeEnumType | undefined; // This is Optional.

    constructor(
        message: string,
        statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
        errorCode?: ErrorCodeEnumType
    ){
       super(message)
       this.statusCode = statusCode
       this.errorCode = errorCode
       Error.captureStackTrace( this, this.constructor )
    }
}

export class NotFoundException extends AppError{
    constructor(message = "Resource not Found", errorCode?: ErrorCodeEnumType){
        super(
            message,
            HTTPSTATUS.NOT_FOUND,
            // if caller passes undefined, fall back to RESOURCE_NOT_FOUND
            errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
        )
    }
}

export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message, statusCode, errorCode);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED 
    );
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType
  ) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
    );
  }
}

// Error.captureStackTrace - This is used to create a useful stack trace for the error. The stack trace helps you determine where the error originated.