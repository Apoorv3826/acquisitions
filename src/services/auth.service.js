import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import logger from '#config/logger.js';

export const hashPassword = async plainPassword => {
  try {
    return await bcrypt.hash(plainPassword, 10);
  } catch (e) {
    logger.error('Password hashing error', e);
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (e) {
    logger.error('Password comparison error', e);
    throw new Error('Password comparison failed');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .where(eq(users.role, role))
      .limit(1)
      .then(rows => rows);
    if (existingUser.length > 0) {
      throw new Error('User with this email and role already exists');
    }
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    logger.info(`New user created: ${newUser.id} (${newUser.email})`);
    return newUser;
  } catch (e) {
    logger.error('User creation error', e);
    throw e;
  }
};

export const signInUser = async (email, password) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then(rows => rows);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    logger.info(`User signed in: ${user.id} (${user.email})`);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (e) {
    logger.error('Sign-in error', e);
    throw e;
  }
};
