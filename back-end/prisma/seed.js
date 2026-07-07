/**
 * Seeds the default admin account (run with `npx prisma db seed`).
 * Admins cannot self-register through the UI, so this is the way
 * the first admin comes to exist.
 *
 * Credentials (change the password after first login!):
 *   email:    admin@lilambazzar.com
 *   password: Admin@123
 */
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

const ADMIN = {
  name: 'Administrator',
  email: 'admin@lilambazzar.com',
  mobile: '9800000000',
  user_role: 'admin',
};

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN.email },
  });
  if (existing) {
    console.log(`Admin already exists (${ADMIN.email}) — nothing to do.`);
    return;
  }

  await prisma.user.create({
    data: { ...ADMIN, password: await hash('Admin@123', 10) },
  });
  console.log(`Seeded admin account: ${ADMIN.email} / Admin@123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
