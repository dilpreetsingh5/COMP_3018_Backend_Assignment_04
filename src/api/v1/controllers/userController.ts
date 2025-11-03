import { Request, Response, NextFunction } from "express";
import { successResponse } from "../models/responseModel";
import { auth } from "../../../config/firebaseConfig";

/**
 * Get user details
 * GET /api/v1/users/:uid
 */
export const getUserHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { uid } = req.params;
        const userRecord = await auth.getUser(uid);
        res.json(successResponse({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: userRecord.customClaims?.role || null,
        }, "User retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * Set custom claims for a user (admin only)
 * POST /api/v1/admin/setCustomClaims
 */
export const setCustomClaimsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { uid, claims } = req.body;
        await auth.setCustomUserClaims(uid, claims);
        res.json(successResponse({ uid, claims }, "Custom claims set successfully"));
    } catch (error) {
        next(error);
    }
};
