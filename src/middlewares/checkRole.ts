import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.jwtPayload?.userId;

    if (!id) {
      return res.status(401).send('No user found in token');
    }

    const userRepository = getRepository(User);

    let user: User;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      return res.status(401).send('User not found');
    }

    if (!roles.includes(user.role)) {
      return res.status(403).send('Access denied');
    }

    next();
  };
};