import request from "supertest";
import app from "../src/app";
import { AppError, AuthenticationError, AuthorizationError } from "../src/api/v1/errors/errors";
import { HTTP_STATUS } from "../src/constants/httpConstants";

// Mock Firebase auth
jest.mock("../src/config/firebaseConfig", () => ({
    auth: {
        verifyIdToken: jest.fn(),
        getUser: jest.fn(),
        setCustomUserClaims: jest.fn(),
    },
}));

describe("Middleware Integration", () => {
    describe("Error Propagation and Response Formatting", () => {
        it("should propagate AppError through middleware and format response correctly", async () => {
            // Mock authentication to pass
            const { auth } = require("../src/config/firebaseConfig");
            (auth.verifyIdToken as jest.Mock).mockResolvedValue({
                uid: "test-uid",
                role: "admin",
            });

            // Mock getUser to throw an AppError
            const error = new AppError("User not found", "USER_NOT_FOUND", HTTP_STATUS.NOT_FOUND);
            (auth.getUser as jest.Mock).mockRejectedValue(error);

            const response = await request(app)
                .get("/api/v1/users/test-uid")
                .set("Authorization", "Bearer valid-token")
                .expect(HTTP_STATUS.NOT_FOUND);

            expect(response.body).toEqual({
                success: false,
                error: {
                    message: "User not found",
                    code: "USER_NOT_FOUND",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle generic errors and format as internal server error", async () => {
            // Mock authentication to pass
            const { auth } = require("../src/config/firebaseConfig");
            (auth.verifyIdToken as jest.Mock).mockResolvedValue({
                uid: "test-uid",
                role: "admin",
            });

            // Mock getUser to throw a generic error
            const genericError = new Error("Database connection failed");
            (auth.getUser as jest.Mock).mockRejectedValue(genericError);

            const response = await request(app)
                .get("/api/v1/users/test-uid")
                .set("Authorization", "Bearer valid-token")
                .expect(500);

            expect(response.body).toEqual({
                success: false,
                error: {
                    message: "An unexpected error occurred",
                    code: "UNKNOWN_ERROR",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle authentication errors properly", async () => {
            // Mock authentication to fail
            const { auth } = require("../src/config/firebaseConfig");
            const authError = new AuthenticationError("Invalid token");
            (auth.verifyIdToken as jest.Mock).mockRejectedValue(authError);

            const response = await request(app)
                .get("/api/v1/users/test-uid")
                .set("Authorization", "Bearer invalid-token")
                .expect(HTTP_STATUS.UNAUTHORIZED);

            expect(response.body).toEqual({
                success: false,
                error: {
                    message: "Invalid token",
                    code: "AUTHENTICATION_ERROR",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle authorization errors properly", async () => {
            // Mock authentication to pass but authorization to fail
            const { auth } = require("../src/config/firebaseConfig");
            (auth.verifyIdToken as jest.Mock).mockResolvedValue({
                uid: "test-uid",
                role: "user", // Not admin
            });

            const response = await request(app)
                .post("/api/v1/admin/setCustomClaims")
                .set("Authorization", "Bearer valid-token")
                .send({ uid: "other-uid", claims: { role: "admin" } })
                .expect(HTTP_STATUS.FORBIDDEN);

            expect(response.body).toEqual({
                success: false,
                error: {
                    message: "Forbidden: Insufficient role",
                    code: "INSUFFICIENT_ROLE",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle successful requests with proper response formatting", async () => {
            // Mock authentication to pass
            const { auth } = require("../src/config/firebaseConfig");
            (auth.verifyIdToken as jest.Mock).mockResolvedValue({
                uid: "test-uid",
                role: "admin",
            });

            // Mock getUser to return user data
            const userRecord = {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                customClaims: { role: "admin" },
            };
            (auth.getUser as jest.Mock).mockResolvedValue(userRecord);

            const response = await request(app)
                .get("/api/v1/users/test-uid")
                .set("Authorization", "Bearer valid-token")
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: "User retrieved successfully",
                data: {
                    uid: "test-uid",
                    email: "test@example.com",
                    displayName: "Test User",
                    role: "admin",
                },
                timestamp: expect.any(String),
            });
        });

        it("should handle custom claims setting with proper error propagation", async () => {
            // Mock authentication to pass
            const { auth } = require("../src/config/firebaseConfig");
            (auth.verifyIdToken as jest.Mock).mockResolvedValue({
                uid: "admin-uid",
                role: "admin",
            });

            // Mock setCustomUserClaims to throw an error
            const firebaseError = new Error("Firebase setCustomUserClaims failed");
            (auth.setCustomUserClaims as jest.Mock).mockRejectedValue(firebaseError);

            const response = await request(app)
                .post("/api/v1/admin/setCustomClaims")
                .set("Authorization", "Bearer admin-token")
                .send({ uid: "test-uid", claims: { role: "user" } })
                .expect(500);

            expect(response.body).toEqual({
                success: false,
                error: {
                    message: "An unexpected error occurred",
                    code: "UNKNOWN_ERROR",
                },
                timestamp: expect.any(String),
            });
        });
    });
});
