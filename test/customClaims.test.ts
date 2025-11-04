import { Request, Response, NextFunction } from "express";
import { getUserHandler, setCustomClaimsHandler } from "../src/api/v1/controllers/userController";

// Mock Firebase auth
jest.mock("../src/config/firebaseConfig", () => ({
    auth: {
        verifyIdToken: jest.fn(),
        getUser: jest.fn(),
        setCustomUserClaims: jest.fn(),
    },
}));

import { auth } from "../src/config/firebaseConfig";

describe("Custom Claims Functionality", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonSpy: jest.SpyInstance;
    let statusSpy: jest.SpyInstance;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jsonSpy = mockRes.json as unknown as jest.SpyInstance;
        statusSpy = mockRes.status as unknown as jest.SpyInstance;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("setCustomClaimsHandler", () => {
        it("should set custom claims correctly", async () => {
            const uid = "test-uid";
            const claims = { role: "admin", permissions: ["read", "write"] };

            mockReq = {
                body: { uid, claims },
            };

            (auth.setCustomUserClaims as jest.Mock).mockResolvedValueOnce(undefined);

            await setCustomClaimsHandler(mockReq as Request, mockRes as Response, mockNext);

            expect(auth.setCustomUserClaims).toHaveBeenCalledWith(uid, claims);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: true,
                message: "Custom claims set successfully",
                data: { uid, claims },
                timestamp: expect.any(String),
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle error when setting claims fails", async () => {
            const uid = "test-uid";
            const claims = { role: "admin" };
            const error = new Error("Firebase error");

            mockReq = {
                body: { uid, claims },
            };

            (auth.setCustomUserClaims as jest.Mock).mockRejectedValueOnce(error);

            await setCustomClaimsHandler(mockReq as Request, mockRes as Response, mockNext);

            expect(auth.setCustomUserClaims).toHaveBeenCalledWith(uid, claims);
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(jsonSpy).not.toHaveBeenCalled();
        });
    });

    describe("getUserHandler", () => {
        it("should retrieve user with custom claims correctly", async () => {
            const uid = "test-uid";
            const userRecord = {
                uid,
                email: "test@example.com",
                displayName: "Test User",
                customClaims: { role: "admin" },
            };

            mockReq = {
                params: { uid },
            };

            (auth.getUser as jest.Mock).mockResolvedValueOnce(userRecord);

            await getUserHandler(mockReq as Request, mockRes as Response, mockNext);

            expect(auth.getUser).toHaveBeenCalledWith(uid);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: true,
                message: "User retrieved successfully",
                data: {
                    uid,
                    email: "test@example.com",
                    displayName: "Test User",
                    role: "admin",
                },
                timestamp: expect.any(String),
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle user without custom claims", async () => {
            const uid = "test-uid";
            const userRecord = {
                uid,
                email: "test@example.com",
                displayName: "Test User",
                customClaims: null,
            };

            mockReq = {
                params: { uid },
            };

            (auth.getUser as jest.Mock).mockResolvedValueOnce(userRecord);

            await getUserHandler(mockReq as Request, mockRes as Response, mockNext);

            expect(auth.getUser).toHaveBeenCalledWith(uid);
            expect(jsonSpy).toHaveBeenCalledWith({
                success: true,
                message: "User retrieved successfully",
                data: {
                    uid,
                    email: "test@example.com",
                    displayName: "Test User",
                    role: null,
                },
                timestamp: expect.any(String),
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle error when retrieving user fails", async () => {
            const uid = "test-uid";
            const error = new Error("User not found");

            mockReq = {
                params: { uid },
            };

            (auth.getUser as jest.Mock).mockRejectedValueOnce(error);

            await getUserHandler(mockReq as Request, mockRes as Response, mockNext);

            expect(auth.getUser).toHaveBeenCalledWith(uid);
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(jsonSpy).not.toHaveBeenCalled();
        });
    });
});
