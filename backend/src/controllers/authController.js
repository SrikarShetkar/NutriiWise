import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Normalize email (trim and lowercase)
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [normalizedEmail, normalizedUsername], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(409).json({ error: user.email === normalizedEmail ? 'Email already registered' : 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [normalizedUsername, normalizedEmail, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const token = jwt.sign({ userId: this.lastID }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d',
          });

          res.status(201).json({
            message: 'User registered successfully',
            userId: this.lastID,
            token,
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Normalize email (trim and lowercase)
    const normalizedEmail = email?.trim().toLowerCase();

    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Email not found. Please register first.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d',
      });

      res.json({
        message: 'Login successful',
        userId: user.id,
        token,
        username: user.username,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

export default { register, login, logout };
