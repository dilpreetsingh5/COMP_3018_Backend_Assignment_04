import { Request, Response, NextFunction } from "express";
import { successResponse } from "../models/responseModel";
import { ServiceError } from "../errors/errors";
import { HTTP_STATUS } from "../../../constants/httpConstants";

// Mock loan data for demonstration
const mockLoans = [
    {
        id: "1",
        applicantName: "John Doe",
        amount: 50000,
        status: "pending",
        riskScore: 75,
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        applicantName: "Jane Smith",
        amount: 25000,
        status: "approved",
        riskScore: 45,
        createdAt: new Date().toISOString(),
    },
];

/**
 * Create a new loan application
 */
export const createLoanHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // For now, return a mock response
        const newLoan = {
            id: "3",
            applicantName: req.body.applicantName || "New Applicant",
            amount: req.body.amount || 0,
            status: "pending",
            riskScore: Math.floor(Math.random() * 100),
            createdAt: new Date().toISOString(),
        };

        res.status(201).json(successResponse(newLoan, "Loan application created successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * Get all loans
 */
export const getLoansHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        res.json(successResponse(mockLoans, "Loans retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * Get a loan by ID
 */
export const getLoanByIdHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { id } = req.params;
        const loan = mockLoans.find((l) => l.id === id);

        if (!loan) {
            throw new ServiceError("Loan not found", "LOAN_NOT_FOUND", HTTP_STATUS.NOT_FOUND);
        }

        res.json(successResponse(loan, "Loan retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * Update a loan (review/update)
 */
export const updateLoanHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { id } = req.params;
        const loan = mockLoans.find((l) => l.id === id);

        if (!loan) {
            throw new ServiceError("Loan not found", "LOAN_NOT_FOUND", HTTP_STATUS.NOT_FOUND);
        }

        // Mock update
        const updatedLoan = {
            ...loan,
            status: req.body.status || loan.status,
            riskScore: req.body.riskScore || loan.riskScore,
            updatedAt: new Date().toISOString(),
        };

        res.json(successResponse(updatedLoan, "Loan updated successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * Approve a loan
 */
export const approveLoanHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { id } = req.params;
        const loan = mockLoans.find((l) => l.id === id);

        if (!loan) {
            throw new ServiceError("Loan not found", "LOAN_NOT_FOUND", HTTP_STATUS.NOT_FOUND);
        }

        // Mock approval
        const approvedLoan = {
            ...loan,
            status: "approved",
            approvedAt: new Date().toISOString(),
        };

        res.json(successResponse(approvedLoan, "Loan approved successfully"));
    } catch (error) {
        next(error);
    }
};
