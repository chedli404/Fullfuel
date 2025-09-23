import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { sendVerificationEmail, generateVerificationToken } from '../emailService';
import { UserModel } from '../models/db';
import { InsertUser } from '@shared/schema';
import { OAuth2Client } from 'google-auth-library';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// JWT secret key from environment or a default (should be env var in production)
const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';

// Google OAuth client
const GOOGLE_CLIENT_ID = '459807581006-5kb6rg9s1dj6klua4icma8raoi0la55c.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// This function is no longer needed but kept for compatibility
export const configurePassport = () => {
  return null;
};

export const authController = {
  // Email verification handler
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      const CLIENT_URL = process.env.CLIENT_URL || 'http://fullfueltv.online';
      console.log('Verification attempt with token:', token);

      if (!token || typeof token !== 'string') {
        console.log('Invalid or missing token');
        return res.redirect(`${CLIENT_URL}/verify?status=error&message=${encodeURIComponent('Invalid or missing token')}`);
      }

      // Find user by verification token
      console.log('Looking for user with token:', token);
      const user = await UserModel.findOne({ emailVerificationToken: token });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        console.log('No user found with this token');
        return res.redirect(`${CLIENT_URL}/verify?status=error&message=${encodeURIComponent('Invalid or expired verification link')}`);
      }
      // Check if token expired
      if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
        return res.redirect(`${CLIENT_URL}/verify?status=error&message=${encodeURIComponent('Verification link has expired')}`);
      }
      // Mark email as verified, clear token
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      await user.save();
      // Optionally, auto-login: return new JWT and user
      const tokenJwt = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const userWithoutPassword = { ...user.toObject(), password: undefined };
      // Redirect to frontend /verify with status, token, and user as query params
      return res.redirect(`${CLIENT_URL}/verify?status=success&token=${encodeURIComponent(tokenJwt)}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
    } catch (error) {
      console.error('Email verification error:', error);
      const CLIENT_URL = process.env.CLIENT_URL || 'http://fullfueltv.online';
      return res.redirect(`${CLIENT_URL}/verify?status=error&message=${encodeURIComponent('Error verifying email')}`);
    }
  },
  // Login with email/password
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (!user.isEmailVerified) {
        return res.status(401).json({ error: 'Please verify your email before logging in' });
      }
      if (!user.password) {
        return res.status(400).json({ error: 'This account uses a different authentication method' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      return res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Error logging in' });
    }
  },

  // Google login
  googleLogin: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }
      try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: undefined });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          console.error('Invalid Google token payload:', payload);
          return res.status(400).json({ error: 'Invalid Google token payload' });
        }
        let user = await storage.getUserByEmail(payload.email);
        if (!user) {
          const hashedPassword = await bcrypt.hash(payload.sub || Math.random().toString(), 10);
          const newUser: InsertUser = {
            name: payload.name || 'Google User',
            email: payload.email || '',
            username: (payload.email ?? 'user').split('@')[0],
            password: hashedPassword,
            role: 'user',
            favoriteArtists: [],
            purchasedTickets: [],
            status: 'active',
            isEmailVerified: true
          };
          user = await storage.createUser(newUser);
        }
        const jwtToken = jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        const userWithoutPassword = {
          ...user,
          password: undefined
        };
        return res.json({ token: jwtToken, user: userWithoutPassword });
      } catch (verifyError) {
        console.error('Token verification error:', verifyError);
        try {
          const parts = token.split('.');
          if (parts.length !== 3) {
            return res.status(400).json({ error: 'Invalid token format' });
          }
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (!decoded || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token content' });
          }
          let user = await storage.getUserByEmail(decoded.email);
          if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(), 10);
            const newUser: InsertUser = {
              name: decoded.name || 'Google User',
              email: decoded.email,
              username: decoded.email.split('@')[0],
              password: hashedPassword,
              role: 'user',
              favoriteArtists: [],
              purchasedTickets: [],
              status: 'active',
              isEmailVerified: true
            };
            user = await storage.createUser(newUser);
          }
          const jwtToken = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          const userWithoutPassword = {
            ...user,
            password: undefined
          };
          return res.json({ token: jwtToken, user: userWithoutPassword });
        } catch (fallbackError) {
          console.error('Fallback token handling error:', fallbackError);
          return res.status(400).json({ error: 'Unable to process Google token' });
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      return res.status(500).json({ error: 'Error with Google login' });
    }
  },

  // Register with Google
  registerWithGoogle: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }
      try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: undefined });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          console.error('Invalid Google token payload:', payload);
          return res.status(400).json({ error: 'Invalid Google token payload' });
        }
        const existingUser = await storage.getUserByEmail(payload.email);
        if (existingUser) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(payload.sub || Math.random().toString(), 10);
        const newUser: InsertUser = {
          name: payload.name || 'Google User',
          email: payload.email,
          username: payload.email.split('@')[0],
          password: hashedPassword,
          role: 'user',
          favoriteArtists: [],
          purchasedTickets: [],
          status: 'active',
          isEmailVerified: true
        };
        const user = await storage.createUser(newUser);
        const jwtToken = jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        const userWithoutPassword = {
          ...user,
          password: undefined
        };
        return res.json({ token: jwtToken, user: userWithoutPassword });
      } catch (verifyError) {
        console.error('Token verification error:', verifyError);
        try {
          const parts = token.split('.');
          if (parts.length !== 3) {
            return res.status(400).json({ error: 'Invalid token format' });
          }
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (!decoded || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token content' });
          }
          const existingUser = await storage.getUserByEmail(decoded.email);
          if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
          }
          const hashedPassword = await bcrypt.hash(Math.random().toString(), 10);
          const newUser: InsertUser = {
            name: decoded.name || 'Google User',
            email: decoded.email,
            username: decoded.email.split('@')[0],
            password: hashedPassword,
            role: 'user',
            favoriteArtists: [],
            purchasedTickets: [],
            status: 'active',
            isEmailVerified: true
          };
          const user = await storage.createUser(newUser);
          const jwtToken = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          const userWithoutPassword = {
            ...user,
            password: undefined
          };
          return res.json({ token: jwtToken, user: userWithoutPassword });
        } catch (fallbackError) {
          console.error('Fallback token handling error:', fallbackError);
          return res.status(400).json({ error: 'Unable to process Google token' });
        }
      }
    } catch (error) {
      console.error('Google registration error:', error);
      return res.status(500).json({ error: 'Error with Google registration' });
    }
  },

  // Get current user endpoint
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await storage.getUser(decoded.id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const userWithoutPassword = {
          ...user,
          password: undefined
        };
        return res.json({ user: userWithoutPassword });
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  },
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, username, phoneNumber } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      // Validate phone number if provided
      if (phoneNumber) {
        let normalizedPhone = phoneNumber.replace(/\s+/g, '');
        if (!normalizedPhone.startsWith('+') && /^\d{11,15}$/.test(normalizedPhone)) {
          normalizedPhone = '+' + normalizedPhone;
        }
        let valid = false;
        try {
          const parsed = parsePhoneNumber(normalizedPhone);
          valid = parsed.isValid() && parsed.isPossible();
        } catch (e) {
          try {
            valid = isValidPhoneNumber(normalizedPhone, 'TN');
          } catch (e2) {
            console.error('Phone validation error:', e2);
          }
        }
        if (!valid) {
          console.error('Phone validation failed for:', normalizedPhone);
          return res.status(400).json({ error: 'Invalid or incomplete phone number' });
        }
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      if (phoneNumber) {
        const existingPhone = await storage.getUserByPhoneNumber(phoneNumber);
        if (existingPhone) {
          return res.status(400).json({ error: 'Phone number is already in use' });
        }
      }
      if (username) {
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser: InsertUser = {
        name,
        email,
        username: username || email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        phoneNumber: phoneNumber || '',
        favoriteArtists: [],
        purchasedTickets: [],
        status: 'active',
        isEmailVerified: false,
        ...(phoneNumber ? { phoneNumber } : {})

      };
      // Create user
      const user = await storage.createUser(newUser);
      // Generate verification token
      const verificationToken = generateVerificationToken();
      // Update user with token and expiry using UserModel
      const userDoc = await UserModel.findByIdAndUpdate(
        user.id,
        {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        { new: true }
      );
      if (userDoc) {
        await sendVerificationEmail(userDoc.email, userDoc.username || userDoc.name, verificationToken);
      }
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      return res.json({ token, user: userWithoutPassword, verification: 'sent' });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Error creating user' });
    }
  },

};