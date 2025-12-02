import { Request, Response, NextFunction } from "express";
import { getUserHandler, setCustomClaimsHandler } from "../userController";
import { auth } from "../../../../config/firebaseConfig";
import { ServiceError } from "../../errors/errors";
import { HTTP_STATUS } from "../../../../constants/httpConstants";

// Mock Firebase auth
jest.mock("../../../../config/firebaseConfig", () => ({
    auth: {
        getUser: jest.fn(),
        setCustomUserClaims: jest.fn(),
    },
}));

describe("User Controller", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();

        mockRequest = {
            body: {},
            params: {},
        };
        mockResponse = {
            json: jsonMock,
        };
        nextFunction = jest.fn();
    });

    describe("getUserHandler", () => {
        it("should return user details when user exists", async () => {
            // Arrange
            mockRequest.params = { id: "user123" };
            const mockUserRecord = {
                uid: "user123",
                email: "user@example.com",
                displayName: "Test User",
                emailVerified: true,
                disabled: false,
                customClaims: { role: "officer" },
                metadata: {
                    creationTime: "2023-01-01T00:00:00Z",
                    lastSignInTime: "2023-01-02T00:00:00Z",
                },
            };

            (auth.getUser as jest.Mock).mockResolvedValueOnce(mockUserRecord);

            // Act
            await getUserHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(auth.getUser).toHaveBeenCalledWith("user123");
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "User details retrieved successfully",
                    data: expect.objectContaining({
                        uid: "user123",
                        email: "user@example.com",
                        role: "officer",
                    }),
                })
            );
        });

        it("should pass ServiceError to next() when user ID is missing", async () => {
            // Arrange
            mockRequest.params = {};

            // Act
            await getUserHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
            const error = nextFunction.mock.calls[0][0];
            expect(error.message).toBe("User ID is required");
            expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it("should pass ServiceError to next() when user not found", async () => {
            // Arrange
            mockRequest.params = { id: "nonexistent" };
            (auth.getUser as jest.Mock).mockRejectedValueOnce({
                code: "auth/user-not-found",
            });

            // Act
            await getUserHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
            const error = nextFunction.mock.calls[0][0];
            expect(error.message).toBe("User not found");
            expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        });
    });

    describe("setCustomClaimsHandler", () => {
        it("should set custom claims successfully", async () => {
            // Arrange
            mockRequest.body = {
                uid: "user123",
                claims: { role: "manager" },
            };

            (auth.setCustomUserClaims as jest.Mock).mockResolvedValueOnce(undefined);

            // Act
            await setCustomClaimsHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(auth.setCustomUserClaims).toHaveBeenCalledWith("user123", {
                role: "manager",
            });
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Custom claims set successfully",
                    data: expect.objectContaining({
                        uid: "user123",
                        claims: { role: "manager" },
                    }),
                })
            );
        });

        it("should pass ServiceError to next() when UID is missing", async () => {
            // Arrange
            mockRequest.body = { claims: { role: "manager" } };

            // Act
            await setCustomClaimsHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
            const error = nextFunction.mock.calls[0][0];
            expect(error.message).toBe("User ID is required");
        });

        it("should pass ServiceError to next() when claims are invalid", async () => {
            // Arrange
            mockRequest.body = { uid: "user123", claims: "invalid" };

            // Act
            await setCustomClaimsHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
            const error = nextFunction.mock.calls[0][0];
            expect(error.message).toBe("Valid claims object is required");
        });
    });
});
