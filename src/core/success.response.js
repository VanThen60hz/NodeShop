"use strict";

const { StatusCodes, ReasonPhrases } = require("../constants/httpStatusCode");

class SuccessResponse {
    constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
        this.message = message || reasonStatusCode;
        this.status = statusCode;
        this.metadata = metadata;
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata });
    }
}

class CREATED extends SuccessResponse {
    constructor({ options = {}, message, metadata }) {
        super({ message, statusCode: StatusCodes.CREATED, reasonStatusCode: ReasonPhrases.CREATED, metadata });
        this.options = options;
    }
}

class NoContent extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, statusCode: StatusCodes.NO_CONTENT, reasonStatusCode: ReasonPhrases.NO_CONTENT, metadata });
    }
}

class Accepted extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, statusCode: StatusCodes.ACCEPTED, reasonStatusCode: ReasonPhrases.ACCEPTED, metadata });
    }
}

module.exports = {
    OK,
    CREATED,
    NoContent,
    Accepted,
};
