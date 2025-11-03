import express from 'express';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
