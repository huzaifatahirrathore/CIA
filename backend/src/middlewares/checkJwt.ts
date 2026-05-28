import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';


export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Debug: print all headers
  console.log('Incoming headers:', req.headers);

  let token: string | undefined;

  // Check standard Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token from Authorization header:', token);
  }

  // Fallback to custom 'auth' header if Authorization is not present
  if (!token && req.headers.auth) {
    if (Array.isArray(req.headers.auth)) {
      token = req.headers.auth[0];
    } else {
      token = req.headers.auth as string;
    }
    console.log('Token from auth header:', token);
  }

  if (!token) {
    console.log('No token found in headers');
    return res.status(401).send('No token provided');
  }

  try {
    const jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    res.locals.jwtPayload = jwtPayload;
    const { userId, username, role } = jwtPayload;
    const newToken = jwt.sign(
      { userId, username, role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    res.setHeader('token', newToken);
    next();
  } catch (error) {
    console.log('JWT verification error:', error);
    return res.status(401).send('Invalid or expired token');
  }
};