import { Request, Response, NextFunction } from "express";
import errorHandler from "../src/api/v1/middleware/errorHandler";
import { AppError, RepositoryError, ServiceError, AuthenticationError, AuthorizationError } from "../src/api/v1/errors/errors";
import { HTTP_STATUS } from "../src/constants/httpConstants";

describe("Error Handling System", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonSpy: jest.SpyInstance;
    let statusSpy: jest.SpyInstance;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        jsonSpy = mockRes.json as unknown as jest.SpyInstance;
        statusSpy = mockRes.status as unknown as jest.SpyInstance;
        // Mock console.error to avoid cluttering test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Error Handler Middleware", () => {
        it("should format AppError responses correctly", () => {
            const error = new AppError("Test error", "TEST_ERROR", HTTP_STATUS.BAD_REQUEST);

            errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Test error",
                    code: "TEST_ERROR",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle non-AppError with internal server error", () => {
            const error = new Error("Generic error");

            errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "An unexpected error occurred",
                    code: "UNKNOWN_ERROR",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle null error gracefully", () => {
            errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "An unexpected error occurred",
                    code: "UNKNOWN_ERROR",
                },
                timestamp: expect.any(String),
            });
        });
    });

    describe("Custom Error Classes", () => {
        describe("AppError", () => {
            it("should create error with correct properties", () => {
                const error = new AppError("Base error", "BASE_ERROR", HTTP_STATUS.BAD_REQUEST);

                expect(error.message).toBe("Base error");
                expect(error.code).toBe("BASE_ERROR");
                expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
                expect(error.name).toBe("AppError");
                expect(error instanceof Error).toBe(true);
            });
        });

        describe("RepositoryError", () => {
            it("should create error with default status code", () => {
                const error = new RepositoryError("Repo error", "REPO_ERROR");

                expect(error.message).toBe("Repo error");
                expect(error.code).toBe("REPO_ERROR");
                expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
                expect(error.name).toBe("RepositoryError");
            });

            it("should create error with custom status code", () => {
                const error = new RepositoryError("Repo error", "REPO_ERROR", HTTP_STATUS.NOT_FOUND);

                expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
            });
        });

        describe("ServiceError", () => {
            it("should create error with default code and status", () => {
                const error = new ServiceError("Service error");

                expect(error.message).toBe("Service error");
                expect(error.code).toBe("SERVICE_ERROR");
                expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
                expect(error.name).toBe("ServiceError");
            });

            it("should create error with custom code", () => {
                const error = new ServiceError("Service error", "CUSTOM_SERVICE_ERROR");

                expect(error.code).toBe("CUSTOM_SERVICE_ERROR");
            });
        });

        describe("AuthenticationError", () => {
            it("should create error with default code and status", () => {
                const error = new AuthenticationError("Auth error");

                expect(error.message).toBe("Auth error");
                expect(error.code).toBe("AUTHENTICATION_ERROR");
                expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
                expect(error.name).toBe("AuthenticationError");
            });

            it("should create error with custom code", () => {
                const error = new AuthenticationError("Auth error", "CUSTOM_AUTH_ERROR");

                expect(error.code).toBe("CUSTOM_AUTH_ERROR");
            });
        });

        describe("AuthorizationError", () => {
            it("should create error with default code and status", () => {
                const error = new AuthorizationError("Authz error");

                expect(error.message).toBe("Authz error");
                expect(error.code).toBe("AUTHORIZATION_ERROR");
                expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
                expect(error.name).toBe("AuthorizationError");
            });

            it("should create error with custom code", () => {
                const error = new AuthorizationError("Authz error", "CUSTOM_AUTHZ_ERROR");

                expect(error.code).toBe("CUSTOM_AUTHZ_ERROR");
            });
        });
    });
});
