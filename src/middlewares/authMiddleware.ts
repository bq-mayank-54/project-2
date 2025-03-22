import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies; // Extract token from cookies

  if (!token) {
    return res.json({ success: false, message: 'Not authorized. Login Again' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.id) {
      req.body.userId = decoded.id;
      next();
    } else {
      return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }
  } catch (error: any) {
    return res.json({ success: false, message: error.message });
  }
};
