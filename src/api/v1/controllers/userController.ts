import { Request, Response, NextFunction } from "express";
import { successResponse } from "../models/responseModel";
import { ServiceError } from "../errors/errors";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { auth } from "../../../config/firebaseConfig";

/**
 * Get user details by UID
 */
export const getUserHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ServiceError("User ID is required", "USER_ID_REQUIRED", HTTP_STATUS.BAD_REQUEST);
        }

        const userRecord = await auth.getUser(id);
        const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: userRecord.customClaims?.role || null,
            emailVerified: userRecord.emailVerified,
            disabled: userRecord.disabled,
            createdAt: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
        };

        res.json(successResponse(userData, "User details retrieved successfully"));
    } catch (error: any) {
        if (error.code === "auth/user-not-found") {
            next(new ServiceError("User not found", "USER_NOT_FOUND", HTTP_STATUS.NOT_FOUND));
        } else {
            next(error);
        }
    }
};

/**
 * Set custom claims for a user (admin only)
 */
export const setCustomClaimsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { uid, claims } = req.body;

        if (!uid) {
            throw new ServiceError("User ID is required", "USER_ID_REQUIRED", HTTP_STATUS.BAD_REQUEST);
        }

        if (!claims || typeof claims !== "object") {
            throw new ServiceError("Valid claims object is required", "CLAIMS_REQUIRED", HTTP_STATUS.BAD_REQUEST);
        }

        await auth.setCustomUserClaims(uid, claims);

        res.json(successResponse({ uid, claims }, "Custom claims set successfully"));
    } catch (error: any) {
        if (error.code === "auth/user-not-found") {
            next(new ServiceError("User not found", "USER_NOT_FOUND", HTTP_STATUS.NOT_FOUND));
        } else {
            next(error);
        }
    }
};
