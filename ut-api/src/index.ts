import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source.js';
import './config/passport.js';

import authRouter from './modules/auth/auth.routes.js';
import vehicleRouter from './modules/vehicles/vehicle.routes.js';
import serviceRouter from './modules/services/service.routes.js';
import appointmentRouter from './modules/appointments/appointment.routes.js';
import adminAppointmentRouter from './modules/appointments/admin-appointment.routes.js';
import transactionRouter from './modules/transactions/transaction.routes.js';
import businessSettingRouter from './modules/business-settings/business-setting.routes.js';
import contactRouter from './modules/contact/contact.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());

AppDataSource.initialize()
  .then(() => console.log('Data source initialized'))
  .catch((err) => console.error('Data source initialization failed', err));

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/services', serviceRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/admin', adminAppointmentRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/settings', businessSettingRouter);
app.use('/api/contact', contactRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
