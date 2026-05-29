import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../entity/User';
import crypto from 'crypto';

export class CreateAdminUser1572547308077 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await queryRunner.manager.getRepository(User).findOne({ where: { username: 'admin' } });
    if (existing) return;

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error(
        'ADMIN_PASSWORD env var must be set before running migrations. ' +
        'Use a strong password (min 8 chars, upper, lower, digit, special char).'
      );
    }

    const user = new User();
    user.username = 'admin';
    user.password = adminPassword;
    user.hashPassword();
    user.role = 'ADMIN';
    await queryRunner.manager.getRepository(User).save(user);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
