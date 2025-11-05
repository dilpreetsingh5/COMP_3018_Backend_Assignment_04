import { Request, Response, NextFunction } from "express";
import isAuthorized from "../authorize";
import { AuthorizationError } from "../../errors/errors";

describe("isAuthorized middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            params: {},
        };
        mockResponse = {
            locals: {},
        };
        nextFunction = jest.fn();
    });

    it("should call next() when user has required role", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user123",
            role: "manager",
        };

        const middleware = isAuthorized({ hasRole: ["officer", "manager"] });

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        // Called without error
        expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should pass AuthorizationError to next() when user has insufficient role", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user123",
            role: "user",
        };

        const middleware = isAuthorized({ hasRole: ["officer"] });

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthorizationError)
        );
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Forbidden: Insufficient role");
        expect(error.code).toBe("INSUFFICIENT_ROLE");
        expect(error.statusCode).toBe(403);
    });

    it("should call next() when same user and allowSameUser is true", () => {
        // Arrange
        mockRequest.params = { id: "user123" };
        // User doesn't have officer role
        mockResponse.locals = {
            uid: "user123",
            role: "user",
        };

        const middleware = isAuthorized({
            hasRole: ["officer"],
            allowSameUser: true,
        });

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        // Should succeed due to allowSameUser
        expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should pass AuthorizationError to next() when role is missing", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user123",
            // No role property
        };

        const middleware = isAuthorized({ hasRole: ["officer"] });

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthorizationError)
        );
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Forbidden: No role found");
        expect(error.code).toBe("ROLE_NOT_FOUND");
    });

    it("should not allow same user when allowSameUser is false", () => {
        // Arrange
        mockRequest.params = { id: "user123" };
        mockResponse.locals = {
            uid: "user123",
            role: "user",
        };

        // Explicitly disabled
        const middleware = isAuthorized({
            hasRole: ["officer"],
            allowSameUser: false,
        });

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthorizationError)
        );
    });
});
