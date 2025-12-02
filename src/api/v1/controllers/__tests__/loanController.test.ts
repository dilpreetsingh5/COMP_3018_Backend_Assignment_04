import { Request, Response, NextFunction } from "express";
import {
    createLoanHandler,
    getLoansHandler,
    getLoanByIdHandler,
    updateLoanHandler,
    approveLoanHandler,
} from "../loanController";
import { ServiceError } from "../../errors/errors";
import { HTTP_STATUS } from "../../../../constants/httpConstants";

describe("Loan Controller", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {
            body: {},
            params: {},
        };
        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };
        nextFunction = jest.fn();
    });

    describe("createLoanHandler", () => {
        it("should create a loan and return success response", () => {
            // Arrange
            mockRequest.body = { applicantName: "Test User", amount: 10000 };

            // Act
            createLoanHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Loan application created successfully",
                    data: expect.objectContaining({
                        applicantName: "Test User",
                        amount: 10000,
                    }),
                })
            );
        });
    });

    describe("getLoansHandler", () => {
        it("should return all loans", () => {
            // Act
            getLoansHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Loans retrieved successfully",
                    data: expect.any(Array),
                })
            );
        });
    });

    describe("getLoanByIdHandler", () => {
        it("should return loan when found", () => {
            // Arrange
            mockRequest.params = { id: "1" };

            // Act
            getLoanByIdHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Loan retrieved successfully",
                    data: expect.objectContaining({ id: "1" }),
                })
            );
        });

        it("should pass ServiceError to next() when loan not found", () => {
            // Arrange
            mockRequest.params = { id: "999" };

            // Act
            getLoanByIdHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
            const error = nextFunction.mock.calls[0][0];
            expect(error.message).toBe("Loan not found");
            expect(error.code).toBe("LOAN_NOT_FOUND");
            expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        });
    });

    describe("updateLoanHandler", () => {
        it("should update loan when found", () => {
            // Arrange
            mockRequest.params = { id: "1" };
            mockRequest.body = { status: "under_review" };

            // Act
            updateLoanHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Loan updated successfully",
                    data: expect.objectContaining({
                        id: "1",
                        status: "under_review",
                    }),
                })
            );
        });

        it("should pass ServiceError to next() when loan not found", () => {
            // Arrange
            mockRequest.params = { id: "999" };

            // Act
            updateLoanHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
        });
    });

    describe("approveLoanHandler", () => {
        it("should approve loan when found", () => {
            // Arrange
            mockRequest.params = { id: "1" };

            // Act
            approveLoanHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Loan approved successfully",
                    data: expect.objectContaining({
                        id: "1",
                        status: "approved",
                    }),
                })
            );
        });

        it("should pass ServiceError to next() when loan not found", () => {
            // Arrange
            mockRequest.params = { id: "999" };

            // Act
            approveLoanHandler(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            // Assert
            expect(nextFunction).toHaveBeenCalledWith(
                expect.any(ServiceError)
            );
        });
    });
});
