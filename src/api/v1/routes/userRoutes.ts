import express from "express";
import { getUserHandler, setCustomClaimsHandler } from "../controllers/userController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router: express.Router = express.Router();

// Get user details (authenticated users can view their own details)
router.get(
    "/users/:id",
    authenticate,
    isAuthorized({ hasRole: ["officer", "manager"], allowSameUser: true }),
    getUserHandler
);

// Set custom claims (admin route - restricted to manager role)
router.post(
    "/admin/setCustomClaims",
    authenticate,
    isAuthorized({ hasRole: ["manager"] }),
    setCustomClaimsHandler
);

export default router;
