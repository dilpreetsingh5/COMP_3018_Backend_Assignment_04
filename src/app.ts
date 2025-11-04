import express from 'express';
import morgan from 'morgan';

import {
    accessLogger,
    errorLogger,
    consoleLogger,
} from "./api/v1/middleware/logger";
import errorHandler from "./api/v1/middleware/errorHandler";
import loanRoutes from "./api/v1/routes/loanRoutes";
import userRoutes from "./api/v1/routes/userRoutes";

const app = express();

// Logging middleware (should be applied early in the middleware stack)
if (process.env.NODE_ENV === "production") {
    // In production, log to files
    app.use(accessLogger);
    app.use(errorLogger);
} else {
    // In development, log to console for immediate feedback
    app.use(consoleLogger);

    // Also log to files in development for demonstration
    app.use(accessLogger);
    app.use(errorLogger);
}

// API Routes
app.use("/api/v1", loanRoutes);
app.use("/api/v1", userRoutes);

// Middleware
app.use(morgan('combined'));
app.use(express.json());

// Global error handling middleware (MUST be applied last)
app.use(errorHandler);

export default app;
