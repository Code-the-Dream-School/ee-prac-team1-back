class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409; // HTTP status code for conflict
    }
}

module.exports = ConflictError;
