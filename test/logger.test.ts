import { Request, Response } from "express";

// Mock morgan before importing logger
jest.mock("morgan", () => jest.fn(() => jest.fn((req, res, next) => next())));

// Mock fs
jest.mock("fs", () => ({
    existsSync: jest.fn(() => false),
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn(),
    appendFileSync: jest.fn(),
}));

// Mock path
jest.mock("path", () => ({
    join: jest.fn((...args) => args.join("/")),
}));

import morgan from "morgan";
import fs from "fs";
import path from "path";

describe("Logger Middleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: jest.Mock;
    let accessLogger: any;
    let errorLogger: any;
    let consoleLogger: any;

    beforeAll(() => {
        // Load the logger module in isolation to capture initialization
        jest.isolateModules(() => {
            const logger = require("../src/api/v1/middleware/logger");
            accessLogger = logger.accessLogger;
            errorLogger = logger.errorLogger;
            consoleLogger = logger.consoleLogger;
        });
    });

    beforeEach(() => {
        mockReq = {
            method: "GET",
            url: "/test",
        };
        mockRes = {
            statusCode: 200,
        };
        nextFunction = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Logger Initialization", () => {
        it("should create logs directory if it doesn't exist", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining("logs"));
            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining("logs"), { recursive: true });
        });

        it("should configure morgan for access logger", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            expect(morgan).toHaveBeenCalledWith("combined", expect.any(Object));
        });

        it("should configure morgan for error logger", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            expect(morgan).toHaveBeenCalledWith("combined", expect.objectContaining({
                skip: expect.any(Function),
            }));
        });

        it("should configure morgan for console logger", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            expect(morgan).toHaveBeenCalledWith("dev");
        });
    });

    describe("Logger Middleware Functions", () => {
        it("should export accessLogger as a function", () => {
            expect(typeof accessLogger).toBe("function");
        });

        it("should export errorLogger as a function", () => {
            expect(typeof errorLogger).toBe("function");
        });

        it("should export consoleLogger as a function", () => {
            expect(typeof consoleLogger).toBe("function");
        });

        it("should call next function when accessLogger is invoked", () => {
            accessLogger(mockReq as Request, mockRes as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });

        it("should call next function when errorLogger is invoked", () => {
            errorLogger(mockReq as Request, mockRes as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });

        it("should call next function when consoleLogger is invoked", () => {
            consoleLogger(mockReq as Request, mockRes as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe("Error Logger Skip Function", () => {
        it("should skip logging for successful requests (status < 400)", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            // Find the skip function from morgan calls
            const morganCalls = (morgan as unknown as jest.Mock).mock.calls;
            const errorLoggerCall = morganCalls.find(call => call[1] && call[1].skip);
            expect(errorLoggerCall).toBeDefined();

            const skipFunction = errorLoggerCall![1].skip;
            expect(skipFunction(mockReq, { statusCode: 200 })).toBe(true);
            expect(skipFunction(mockReq, { statusCode: 201 })).toBe(true);
            expect(skipFunction(mockReq, { statusCode: 399 })).toBe(true);
        });

        it("should not skip logging for error responses (status >= 400)", () => {
            jest.isolateModules(() => {
                require("../src/api/v1/middleware/logger");
            });
            const morganCalls = (morgan as unknown as jest.Mock).mock.calls;
            const errorLoggerCall = morganCalls.find(call => call[1] && call[1].skip);
            expect(errorLoggerCall).toBeDefined();

            const skipFunction = errorLoggerCall![1].skip;
            expect(skipFunction(mockReq, { statusCode: 400 })).toBe(false);
            expect(skipFunction(mockReq, { statusCode: 404 })).toBe(false);
            expect(skipFunction(mockReq, { statusCode: 500 })).toBe(false);
        });
    });
});
