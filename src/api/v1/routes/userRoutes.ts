import express from "express";
import { getUserHandler, setCustomClaimsHandler } from "../controllers/userController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router: express.Router = express.Router();

// User routes
router.get("/users/:uid", authenticate, getUserHandler);

// Admin routes
router.post(
    "/admin/setCustomClaims",
    authenticate,
    isAuthorized({ hasRole: ["admin"], allowSameUser: true }),
    setCustomClaimsHandler
);

export default router;
