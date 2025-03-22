import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.body.role;
    if (!roles.includes(userRole))
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    next();
  };
};
