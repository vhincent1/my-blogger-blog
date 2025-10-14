import { StatusCodes } from 'http-status-codes';
export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly parameters: Object
  readonly responseObject: T;
  readonly statusCode: number;

  private constructor(success: boolean, message: string, parameters: Object, responseObject: T, statusCode: number) {
    this.success = success;
    this.message = message;
    this.parameters = parameters
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }

  static success<T>(message: string, parameters: Object, responseObject: T, statusCode: number = StatusCodes.OK) {
    return new ServiceResponse(true, message, parameters, responseObject, statusCode);
  }

  static failure<T>(message: string, parameters: Object, responseObject: T, statusCode: number = StatusCodes.BAD_REQUEST) {
    return new ServiceResponse(false, message, parameters, responseObject, statusCode);
  }
}

