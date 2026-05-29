import crypto from 'crypto';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import config from '../config/config';
import { User } from '../entity/User';
import { RefreshToken } from '../entity/RefreshToken';

const REFRESH_TOKEN_TTL_DAYS = 7;
const REFRESH_COOKIE = 'refreshToken';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function issueAccessToken(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: '15m' }
  );
}

async function issueRefreshToken(user: User, res: Response): Promise<void> {
  const raw = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  const rt = new RefreshToken();
  rt.tokenHash = hashToken(raw);
  rt.user = user;
  rt.expiresAt = expiresAt;
  rt.isRevoked = false;

  await AppDataSource.getRepository(RefreshToken).save(rt);

  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: expiresAt,
    path: '/auth',
  });
}

async function revokeRefreshToken(raw: string): Promise<void> {
  const repo = AppDataSource.getRepository(RefreshToken);
  const rt = await repo.findOne({ where: { tokenHash: hashToken(raw) } });
  if (rt) {
    rt.isRevoked = true;
    await repo.save(rt);
  }
}

class AuthController {

  public static register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = new User();
    user.username = username;
    user.password = password;
    user.role = 'NORMAL';

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    user.hashPassword();

    const userRepository = AppDataSource.getRepository(User);
    try {
      await userRepository.save(user);
    } catch {
      return res.status(409).send('username already in use');
    }

    return res.status(201).send('User created');
  };

  public static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send('Body was empty');
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch {
      return res.status(401).send('username or password incorrect');
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).send('username or password incorrect');
    }

    const accessToken = issueAccessToken(user);
    await issueRefreshToken(user, res);

    res.cookie('loggedIn', '1', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  };

  public static refresh = async (req: Request, res: Response) => {
    const raw: string | undefined = req.cookies?.[REFRESH_COOKIE];

    if (!raw) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const repo = AppDataSource.getRepository(RefreshToken);
    const rt = await repo.findOne({
      where: { tokenHash: hashToken(raw) },
      relations: { user: true },
    });

    if (!rt || rt.isRevoked || rt.expiresAt < new Date()) {
      res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
      res.clearCookie('loggedIn');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate: revoke old token and issue a new one
    rt.isRevoked = true;
    await repo.save(rt);

    const accessToken = issueAccessToken(rt.user);
    await issueRefreshToken(rt.user, res);

    return res.json({ accessToken });
  };

  public static logout = async (_req: Request, res: Response) => {
    const raw: string | undefined = _req.cookies?.[REFRESH_COOKIE];

    if (raw) {
      await revokeRefreshToken(raw);
    }

    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    res.clearCookie('loggedIn');
    return res.status(204).send();
  };

  public static getMe = async (_req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOneOrFail({
        select: { id: true, username: true, role: true },
        where: { id: res.locals.jwtPayload.userId },
      });
      return res.json({ user });
    } catch {
      return res.status(404).send('User not found');
    }
  };

  public static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      return res.status(400).send('Missing fields');
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch {
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

    // Revoke all existing refresh tokens for this user on password change
    await AppDataSource.getRepository(RefreshToken).update(
      { user: { id } },
      { isRevoked: true }
    );

    return res.status(204).send();
  };
}

export default AuthController;
