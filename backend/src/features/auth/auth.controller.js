const jwt = require('jsonwebtoken');
const User = require('./user.model');

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'transitops_jwt_access_secret_key',
    { expiresIn: '8h' }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_REFRESH_SECRET || 'transitops_jwt_refresh_secret_key',
    { expiresIn: '7d' }
  );
};

// Register a new user (restricted to Admin and FleetManager)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (name, email, password, role) are required' });
    }

    // Explicit unique check before insert for user-friendly error message
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: `A user with email '${email}' already exists.` });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // hooks will hash it
      role
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred during user registration.' });
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user record
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};

// Refresh Access Token
exports.token = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'transitops_jwt_refresh_secret_key');
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      return res.status(403).json({ error: 'Refresh token is not active or user not found' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during token refresh.' });
  }
};

// Logout User
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(400).json({ error: 'Invalid refresh token or user already logged out' });
    }

    user.refreshToken = null;
    await user.save();

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during logout.' });
  }
};

// Get current profile
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -refreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching user profile.' });
  }
};
