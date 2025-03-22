import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { AuthRequest } from './types/authRequest.js';

import passport from "passport";
import './config/passport.js'; 
import session from 'express-session';

import dotenv from 'dotenv';
dotenv.config();

import cookieParser from "cookie-parser";




const app = express();


app.use(cookieParser());

// Middlewares
app.use(cors());
app.use(express.json());


app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      httpOnly: true,
      sameSite: 'strict',
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());


// Test Route
app.get('/', (req, res) => {
  res.send('🚀 Task Management API is running');
});



// Load Routes
console.log('🔄 Loading routes...');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

console.log('✅ Auth routes loaded');
console.log('✅ Task routes loaded');
console.log('✅ User routes loaded');




app.get("/dashboard", (req: AuthRequest, res : any) => {
  try {
    console.log("andar hein dashboard")
    res.send("Registered");
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





export default app;


