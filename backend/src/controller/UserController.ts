import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

class UserController {
  public static listAll = async (_req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true },
    });
    res.send(users);
  };

  public static getOneById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userRepository = AppDataSource.getRepository(User);
    try {
      const user = await userRepository.findOneOrFail({
        where: { id },
        select: { id: true, username: true, role: true },
      });
      res.status(200).send(user);
    } catch (error) {
      res.status(404).send('User not found');
    }
  };

  public static newUser = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const user = new User();
    user.username = username;
    user.password = password;
    if (role !== 'NORMAL' && role !== 'ADMIN') {
      res.status(400).send('Provide role is unknown.');
      return;
    }
    user.role = role;

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();

    const userRepository = AppDataSource.getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }

    res.status(201).send('User created');
  };

  public static editUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { username, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ where: { id: Number(id) } });
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }

    // Prevent demoting the last admin
    if (user.role === 'ADMIN' && role === 'NORMAL') {
      const adminCount = await userRepository.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        res.status(409).send('Cannot demote the last admin');
        return;
      }
    }

    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }
    res.status(204).send();
  };

  public static deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const userRepository = AppDataSource.getRepository(User);
    try {
      await userRepository.findOneOrFail({ where: { id } });
      await userRepository.delete(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }

    res.status(204).send();
  };
}

export default UserController;
