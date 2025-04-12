import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { storage } from './storage';
import { User } from '@shared/schema';
import crypto from 'crypto';

// JWT secret key - in production, this should be in env variables
const JWT_SECRET = process.env.JWT_SECRET || 'catalog-builder-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'catalog-builder-session-secret';

// Configure passport local strategy (username/password)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Compare password with hashed password in database
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Update last login time
      await storage.updateUser(user.id, {
        lastLogin: new Date()
      });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Helper function to generate JWT token
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Helper function to verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Generate password reset token
export function generateResetToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

// Middleware to check if the user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check for token in headers
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (decoded) {
      // Add user info to request
      req.user = decoded;
      return next();
    }
  }
  
  // Check if authenticated through session
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check if the user has admin role
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
}

// Setup authentication middleware
export function setupAuth(app: Express) {
  // Session configuration
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Auth routes
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          message: info.message || 'Authentication failed'
        });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Don't send the password back to the client
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        return res.json({
          user: userWithoutPassword,
          token
        });
      });
    })(req, res, next);
  });
  
  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Check current user
  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password back to client
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });
  
  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      
      // Check if the user already exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create the new user (default role is 'user')
      const newUser = await storage.createUser({
        email,
        name,
        password: hashedPassword,
        role: 'user'
      });
      
      // Generate token
      const token = generateToken(newUser);
      
      // Don't send the password back to the client
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Find the user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }
      
      // Generate reset token
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
      // Update user with reset token
      await storage.updateUserResetToken(email, resetToken, resetTokenExpiry);
      
      // In a real app, send email with reset link
      // For development, just return the token
      
      res.json({
        message: 'Password reset email sent',
        // Remove this in production
        resetToken
      });
    } catch (err) {
      res.status(500).json({ message: 'Error processing request' });
    }
  });
  
  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      // Find user with this reset token
      const users = await storage.getUsers();
      const user = users.find(u => u.resetToken === token);
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      
      // Check if token is expired
      if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: 'Reset token has expired' });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Update user with new password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });
      
      res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error resetting password' });
    }
  });
  
  // Change password route (when logged in)
  app.post('/api/auth/change-password', isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req.user as any).id;
      
      // Get the user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the password
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error changing password' });
    }
  });
}