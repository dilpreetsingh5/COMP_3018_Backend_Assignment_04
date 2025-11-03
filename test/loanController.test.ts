import { Request, Response, NextFunction } from "express";
import {
    createLoanHandler,
    getLoansHandler,
    getLoanByIdHandler,
    updateLoanHandler,
    approveLoanHandler,
} from "../src/api/v1/controllers/loanController";

describe("Loan Controller", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockRequest = {};
        mockResponse = {
            json: jsonMock,
            status: statusMock,
        };
        mockNext = jest.fn();
    });

    describe("createLoanHandler", () => {
        it("should create a loan and return success response", () => {
            mockRequest.body = { amount: 5000 };

            createLoanHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loan application created successfully",
                data: expect.objectContaining({
                    id: "loan-123",
                    amount: 5000,
                    status: "pending",
                }),
                timestamp: expect.any(String),
            });
        });

        it("should use default amount when not provided", () => {
            mockRequest.body = {};

            createLoanHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loan application created successfully",
                data: expect.objectContaining({
                    amount: 10000,
                }),
                timestamp: expect.any(String),
            });
        });
    });

    describe("getLoansHandler", () => {
        it("should return list of loans", () => {
            getLoansHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loans retrieved successfully",
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: "loan-123",
                        amount: 10000,
                        status: "pending",
                    }),
                ]),
                timestamp: expect.any(String),
            });
        });
    });

    describe("getLoanByIdHandler", () => {
        it("should return loan by id", () => {
            mockRequest.params = { id: "loan-456" };

            getLoanByIdHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loan retrieved successfully",
                data: expect.objectContaining({
                    id: "loan-456",
                }),
                timestamp: expect.any(String),
            });
        });
    });

    describe("updateLoanHandler", () => {
        it("should update loan and return success response", () => {
            mockRequest.params = { id: "loan-456" };
            mockRequest.body = { status: "reviewed" };

            updateLoanHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loan updated successfully",
                data: expect.objectContaining({
                    id: "loan-456",
                    status: "reviewed",
                }),
                timestamp: expect.any(String),
            });
        });
    });

    describe("approveLoanHandler", () => {
        it("should approve loan and return success response", () => {
            mockRequest.params = { id: "loan-456" };

            approveLoanHandler(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Loan approved successfully",
                data: expect.objectContaining({
                    id: "loan-456",
                    status: "approved",
                }),
                timestamp: expect.any(String),
            });
        });
    });
});
