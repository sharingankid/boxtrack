// Creates an admin account (or resets its password) without ever writing a
// credential to the repo - the production owner account must not be the
// seed's demo coach. Usage:
//
//   npm run user:create -- --email timothe@crossfitlab.fr --role owner
//
// The password is read from the BOXTRACK_PASSWORD environment variable, or
// asked interactively when it isn't set. Re-running it for an existing email
// resets that account's password and logs out all of its devices.
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const userModel = require('../src/models/userModel');
const { normalizeEmail } = require('../src/services/authService');

const ROLES = ['owner', 'coach', 'staff'];
const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_COST = 12;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--email') args.email = argv[i + 1];
    if (argv[i] === '--role') args.role = argv[i + 1];
  }
  return args;
}

function askPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Mute the echo so the password never shows up in the terminal.
    rl._writeToOutput = (text) => {
      if (text.includes('Password')) rl.output.write(text);
    };
    rl.question('Password: ', (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  const { email, role = 'coach' } = parseArgs(process.argv.slice(2));
  if (!email || !email.includes('@')) {
    throw new Error('Usage: npm run user:create -- --email <email> [--role owner|coach|staff]');
  }
  if (!ROLES.includes(role)) {
    throw new Error(`--role must be one of ${ROLES.join(', ')}`);
  }

  const password = process.env.BOXTRACK_PASSWORD || (await askPassword());
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const normalized = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const existing = await userModel.findByEmail(normalized);

  if (existing) {
    await userModel.updatePassword(existing.id, passwordHash);
    console.log(`Password reset for ${normalized} (all existing sessions revoked).`);
  } else {
    const user = await userModel.create({ email: normalized, passwordHash, role });
    console.log(`Created ${user.role} account ${user.email} (id ${user.id}).`);
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
