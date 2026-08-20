require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: 'admin@welfai.com' });
    if (existingAdmin) {
      console.log('Admin account already exists.');
      await mongoose.disconnect();
      return;
    }

    const adminUser = await User.create({
      fullName: 'System Administrator',
      nic: '000000000000',
      email: 'admin@welfai.com',
      phone: '0710000000',
      password: 'Admin@123',
      district: 'Colombo',
      role: 'admin',
      isActive: true,
    });

    console.log(`Admin account created with ID: ${adminUser._id}`);
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
