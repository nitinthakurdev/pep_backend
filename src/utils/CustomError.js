import { StatusCodes } from 'http-status-codes';

export class CustomError extends Error {
  constructor(message, comingFrom) {
    super(message);
    this.comingFrom = comingFrom;
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    this.status = 'error';

    Error.captureStackTrace(this, this.constructor);
  }

  serializeErrors() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      comingFrom: this.comingFrom,
    };
  }
}

export class BadRequestError extends CustomError {
  constructor(message, comingFrom) {
    super(message, comingFrom);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export class NotFoundError extends CustomError {
  constructor(message, comingFrom) {
    super(message, comingFrom);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export class NotFoundPageError extends CustomError {
  constructor(message, comingFrom) {
    super(message, comingFrom);
    this.statusCode = StatusCodes.NOT_FOUND;
    this.status = 'page';
  }
}
