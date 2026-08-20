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
  // can never self-register as admin — applicant is the only public role.
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
    _id: user._id,
    fullName: user.fullName,
    nic: user.nic,
    email: user.email,
    phone: user.phone,
    district: user.district,
    role: user.role,
    token: generateToken(user._id, user.role),
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

  // password has select:false on the schema, so it must be explicitly requested.
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
    _id: user._id,
    fullName: user.fullName,
    nic: user.nic,
    email: user.email,
    phone: user.phone,
    district: user.district,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update logged-in user's profile (email, phone, fullName)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { phone, email, fullName } = req.body;

  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(400);
      throw new Error('An account with this email address already exists');
    }
    user.email = email.toLowerCase();
  }

  if (phone) user.phone = phone;
  if (fullName) user.fullName = fullName;

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

// @desc    Change logged-in user's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user.userId).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};
