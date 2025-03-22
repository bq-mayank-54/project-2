import { Request } from "express";

// ✅ Define AuthRequest Interface to Extend Request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}