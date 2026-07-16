const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (applicant by default)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, nic, email, phone, password, district } = req.body;

  if (!fullName || !nic || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const userExists = await User.findOne({ $or: [{ email }, { nic }] });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email or NIC already exists');
  }

  // role is intentionally not accepted from req.body here so a caller
  // can never self-register as admin — applicant is the only public role
  const user = await User.create({
    fullName,
    nic,
    email,
    phone,
    password,
    district,
    role: 'applicant',
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // password has select:false on the schema, so it must be explicitly requested
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Please contact support.');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the `protect` middleware
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = { registerUser, loginUser, getMe };
