import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from '@/database/data-source';
import { UserRole } from '@/common/enums/user-role.enum';
import { User } from '@/modules/users/entities/user.entity';

/**
 * There is no public signup path for SUPER_ADMIN (by design — see spec §1/§2.1,
 * signup only offers CLIENT/SEEKER/BOTH). This script is how the first admin
 * account gets created, in dev and in real deployments alike.
 *
 * Usage: SEED_ADMIN_EMAIL=admin@joblinxs.com SEED_ADMIN_PASSWORD=Passw0rd123 npm run seed:admin
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars are required');
  }

  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(password, 12);
  let user = await userRepository.findOne({ where: { email: email.toLowerCase() } });

  if (user) {
    user.passwordHash = passwordHash;
    user.roles = Array.from(new Set([...user.roles, UserRole.SUPER_ADMIN]));
    user.activeRole = UserRole.SUPER_ADMIN;
    user.emailVerified = true;
    user.isActive = true;
    user.isBanned = false;
    console.log(`Updated existing user ${email} to SUPER_ADMIN.`);
  } else {
    user = userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      roles: [UserRole.SUPER_ADMIN],
      activeRole: UserRole.SUPER_ADMIN,
      emailVerified: true,
      isActive: true,
      tosVersionAccepted: 'seed',
    });
    console.log(`Created new SUPER_ADMIN user ${email}.`);
  }

  await userRepository.save(user);
  await dataSource.destroy();
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
