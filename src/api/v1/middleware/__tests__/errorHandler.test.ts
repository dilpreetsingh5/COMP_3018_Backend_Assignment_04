import { Request, Response, NextFunction } from "express";
import errorHandler from "../errorHandler";
import {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ServiceError,
} from "../../errors/errors";
import { HTTP_STATUS } from "../../../../constants/httpConstants";

describe("errorHandler middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {};
        mockResponse = {
            status: statusMock,
        };
        nextFunction = jest.fn();
    });

    it("should handle AuthenticationError with correct status and message", () => {
        // Arrange
        const error = new AuthenticationError("Invalid token", "TOKEN_INVALID");

        // Act
        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Invalid token",
                code: "TOKEN_INVALID",
            },
            timestamp: expect.any(String),
        });
    });

    it("should handle AuthorizationError with correct status and message", () => {
        // Arrange
        const error = new AuthorizationError(
            "Insufficient permissions",
            "INSUFFICIENT_ROLE"
        );

        // Act
        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Insufficient permissions",
                code: "INSUFFICIENT_ROLE",
            },
            timestamp: expect.any(String),
        });
    });

    it("should handle generic Error with 500 status", () => {
        // Arrange
        const error = new Error("Unexpected error");

        // Act
        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(statusMock).toHaveBeenCalledWith(
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "An unexpected error occurred",
                code: "UNKNOWN_ERROR",
            },
            timestamp: expect.any(String),
        });
    });

    it("should handle null error gracefully", () => {
        // Act
        errorHandler(
            null,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(statusMock).toHaveBeenCalledWith(
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "An unexpected error occurred",
                code: "UNKNOWN_ERROR",
            },
            timestamp: expect.any(String),
        });
    });

    it("should handle ServiceError with custom status code", () => {
        // Arrange
        const error = new ServiceError(
            "Validation failed",
            "VALIDATION_ERROR",
            422
        );

        // Act
        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(statusMock).toHaveBeenCalledWith(422);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Validation failed",
                code: "VALIDATION_ERROR",
            },
            timestamp: expect.any(String),
        });
    });
});
