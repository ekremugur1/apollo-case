export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, status: number) {
    super(message);
    this.statusCode = status;
  }
}

export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export class UnauthorizedException extends CustomError {
  constructor(message: string = "Unauthorized access denied") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class BadRequestException extends CustomError {
  constructor(message: string = "Naughty request") {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenException extends CustomError {
  constructor(message: string = "You have requested a forbidden resource") {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string = "The resource you requested does not exist") {
    super(message, HttpStatus.NOT_FOUND);
  }
}
