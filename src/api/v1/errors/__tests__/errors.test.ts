import {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ServiceError,
    RepositoryError,
} from "../errors";
import { HTTP_STATUS } from "../../../../constants/httpConstants";

describe("Custom Error Classes", () => {
    describe("AppError", () => {
        it("should create an AppError with correct properties", () => {
            const error = new AppError("Test error", "TEST_ERROR", 400);

            expect(error.message).toBe("Test error");
            expect(error.code).toBe("TEST_ERROR");
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe("AppError");
            expect(error instanceof Error).toBe(true);
        });
    });

    describe("AuthenticationError", () => {
        it("should create an AuthenticationError with default status code", () => {
            const error = new AuthenticationError("Invalid token");

            expect(error.message).toBe("Invalid token");
            expect(error.code).toBe("AUTHENTICATION_ERROR");
            expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(error instanceof AppError).toBe(true);
            expect(error instanceof AuthenticationError).toBe(true);
        });

        it("should create an AuthenticationError with custom code", () => {
            const error = new AuthenticationError("Token expired", "TOKEN_EXPIRED");

            expect(error.message).toBe("Token expired");
            expect(error.code).toBe("TOKEN_EXPIRED");
            expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe("AuthorizationError", () => {
        it("should create an AuthorizationError with default status code", () => {
            const error = new AuthorizationError("Access denied");

            expect(error.message).toBe("Access denied");
            expect(error.code).toBe("AUTHORIZATION_ERROR");
            expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
            expect(error instanceof AppError).toBe(true);
            expect(error instanceof AuthorizationError).toBe(true);
        });

        it("should create an AuthorizationError with custom code", () => {
            const error = new AuthorizationError("Insufficient role", "INSUFFICIENT_ROLE");

            expect(error.message).toBe("Insufficient role");
            expect(error.code).toBe("INSUFFICIENT_ROLE");
            expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
        });
    });

    describe("ServiceError", () => {
        it("should create a ServiceError with default status code and code", () => {
            const error = new ServiceError("Service unavailable");

            expect(error.message).toBe("Service unavailable");
            expect(error.code).toBe("SERVICE_ERROR");
            expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(error instanceof AppError).toBe(true);
            expect(error instanceof ServiceError).toBe(true);
        });

        it("should create a ServiceError with custom code and status", () => {
            const error = new ServiceError("Validation failed", "VALIDATION_ERROR", 422);

            expect(error.message).toBe("Validation failed");
            expect(error.code).toBe("VALIDATION_ERROR");
            expect(error.statusCode).toBe(422);
        });
    });

    describe("RepositoryError", () => {
        it("should create a RepositoryError with default status code", () => {
            const error = new RepositoryError("Database connection failed", "REPOSITORY_ERROR");

            expect(error.message).toBe("Database connection failed");
            expect(error.code).toBe("REPOSITORY_ERROR");
            expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(error instanceof AppError).toBe(true);
            expect(error instanceof RepositoryError).toBe(true);
        });

        it("should create a RepositoryError with custom code and status", () => {
            const error = new RepositoryError("Record not found", "NOT_FOUND", 404);

            expect(error.message).toBe("Record not found");
            expect(error.code).toBe("NOT_FOUND");
            expect(error.statusCode).toBe(404);
        });
    });
});
