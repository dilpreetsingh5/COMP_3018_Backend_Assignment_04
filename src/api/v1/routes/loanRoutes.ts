import express from "express";
import {
    createLoanHandler,
    getLoansHandler,
    getLoanByIdHandler,
    updateLoanHandler,
    approveLoanHandler,
} from "../controllers/loanController";

const router: express.Router = express.Router();

// Loan application routes
router.post("/loans", createLoanHandler);
router.get("/loans", getLoansHandler);
router.get("/loans/:id", getLoanByIdHandler);
router.put("/loans/:id", updateLoanHandler);
router.put("/loans/:id/approve", approveLoanHandler);

export default router;