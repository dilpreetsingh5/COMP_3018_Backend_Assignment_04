import express from "express";
import {
    createLoanHandler,
    getLoansHandler,
    getLoanByIdHandler,
    updateLoanHandler,
    approveLoanHandler,
} from "../controllers/loanController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router: express.Router = express.Router();

router.post(
    "/loans",
    authenticate,
    isAuthorized({ hasRole: ["user"] }),
    createLoanHandler
);

router.get("/loans", authenticate, isAuthorized({ hasRole: ["officer", "manager"] }), getLoansHandler);

router.get("/loans/:id", authenticate, getLoanByIdHandler);

router.put(
    "/loans/:id",
    authenticate,
    isAuthorized({ hasRole: ["officer", "manager"], allowSameUser: true }),
    updateLoanHandler
);

router.put(
    "/loans/:id/approve",
    authenticate,
    isAuthorized({ hasRole: ["manager"] }),
    approveLoanHandler
);

export default router;
