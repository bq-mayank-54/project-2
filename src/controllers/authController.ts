import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import passport from 'passport'

// // Register user
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize role to match the enum
    const normalizedRole = role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();
    const isValidRole = ["User", "Admin"].includes(normalizedRole);

    if (!isValidRole) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: normalizedRole 
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "User registered successfully", role: user.role });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Verification OTP
export const sendVerifyOtp = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isAccountVerified)
      return res.status(400).json({ success: false, message: 'Account already verified' });

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // Set expiry to 10 minutes
    await user.save();

    // Send email
    await sendEmail(user.email, 'Account Verification OTP', `Your OTP is: ${otp}`);

    res.json({ success: true, message: 'Verification OTP sent to email' });
  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  if (!userId || !otp)
    return res.status(400).json({ success: false, message: 'Missing details' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isAccountVerified)
      return res.status(400).json({ success: false, message: 'Account already verified' });

    if (user.verifyOtp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (user.verifyOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired' });

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('❌ Error verifying email:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Send Reset OTP
export const sendResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP for resetting your password is ${otp}.`);
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.resetOtp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.resetOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Google OAuth Login (stub)
export const googleLogin = async (req: Request, res: Response) => {
  // Implement Google OAuth logic or use a Passport strategy here
  res.json({ success: true, message: 'Google OAuth login endpoint (stub)' });
};

// Redirect to Google for authentication
// export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

// // Google OAuth callback
// export const googleAuthCallback = (req: Request, res: Response) => {
//   passport.authenticate("google", { failureRedirect: "/login" }, (err, user) => {
//     if (err || !user) {
//       return res.redirect("/login?error=AuthenticationFailed");
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.redirect("/dashboard"); // Redirect to your frontend dashboard
//   })(req, res);
// };

// Auth0 Login (stub)
export const auth0Login = async (req: Request, res: Response) => {
  // Implement Auth0 login logic or use a Passport strategy here
  res.json({ success: true, message: 'Auth0 login endpoint (stub)' });
};

// Check if user is authenticated
export const isAuthenticated = (req: Request, res: Response) => {
  res.json({ success: true, message: 'User is authenticated' });
};
