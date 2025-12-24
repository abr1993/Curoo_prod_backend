import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';
import constRoutes from './routes/constants.js'
import providerRoutes from './routes/providers.js'
import consultRoutes from './routes/consults.js'
import specialtyRoutes from './routes/specialty.js'

import path from 'path';
//import { attachAuditMiddleware } from './middleware/auditFields.js';


//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://main.dw1ff597dehys.amplifyapp.com', // frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

//app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use('/api', authRoutes);
// Routes
app.use("/api/constants", constRoutes);
app.use('/api', specialtyRoutes);
app.use('/api', paymentRoutes);

app.use('/api', providerRoutes);
app.use('/api', consultRoutes);
//app.use('/api', cronRoutes);

// Health check (important for debugging)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Export Lambda handler
export const handler = serverless(app);


