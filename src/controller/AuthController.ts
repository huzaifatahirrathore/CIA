import { validate } from 'class-validator';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import config from '../config/config';
import { User } from '../entity/User';

class AuthController {

  // REGISTER
  public static register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = new User();
    user.username = username;
    user.password = password;
    user.role = "ADMIN";

    // validate input
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    // hash password
    user.hashPassword();

    const userRepository = getRepository(User);

    try {
      await userRepository.save(user);
    } catch (e) {
      return res.status(409).send('username already in use');
    }

    return res.status(201).send('User created');
  };


  // LOGIN
  public static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send('Body was empty');
    }

    const userRepository = getRepository(User);

    let user: User;

    try {
      user = await userRepository.findOneOrFail({
        where: { username },
      });
    } catch (error) {
      return res.status(401).send('username or password incorrect');
    }

    // check password
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).send('username or password incorrect');
    }

    // FIXED: include role in JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role   // ✅ IMPORTANT FIX
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return res.send({ token });
  };


  // GET LOGGED IN USER
  public static getMe = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);

    try {
      const user = await userRepository.findOneOrFail({
        select: ['id', 'username', 'role'],
        where: { id: res.locals.jwtPayload.userId },
      });

      return res.send({ user });

    } catch (error) {
      return res.status(404).send('User not found');
    }
  };


  // CHANGE PASSWORD
  public static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      return res.status(400).send('Missing fields');
    }

    const userRepository = getRepository(User);

    let user: User;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      return res.status(401).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      return res.status(401).send();
    }

    user.password = newPassword;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    user.hashPassword();
    await userRepository.save(user);

    return res.status(204).send();
  };
}

export default AuthController;