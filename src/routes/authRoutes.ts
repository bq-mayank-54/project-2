console.log("Auth Routes file loaded...");
// import passport from 'passport';

import express from 'express';
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  googleLogin,
  auth0Login,
  isAuthenticated
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/send-verify-otp', authMiddleware, sendVerifyOtp);
router.post('/verify-account', authMiddleware, verifyEmail);
router.post('/is-auth', authMiddleware, isAuthenticated);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

// // Multi-auth endpoints (stubs)
// router.get(
//     "/google",(res,req,next:NextFunction)=>{console.log("as"), next()},
    
//     passport .authenticate("google", { scope: ["profile", "email"] })
//   );
  
//   // ✅ Handle Google OAuth Callback
//   router.get(
//     "/google/callback",
//     passport.authenticate("google", { session: false }),
//     (req, res) => {
//       console.log("puch gye callback mein")
//       res.redirect(process.env.redirect as string);
//       const token = 1;
//       if (token) {
        
//       } else {
//         res.status(401).json({ message: "Authentication failed" });
//       }
//     }
//   );
router.post('/auth0', auth0Login);

export default router;
