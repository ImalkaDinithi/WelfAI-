const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoUri);

    const email = (process.env.SUPERADMIN_EMAIL || 'superadmin@welfai.com').toLowerCase();
    const password = process.env.SUPERADMIN_PASSWORD || 'Superadmin@123';
    const fullName = process.env.SUPERADMIN_NAME || 'Super Administrator';

    const existingSuperAdmin = await User.findOne({
      $or: [{ email }, { role: 'superadmin' }],
    });

    if (existingSuperAdmin) {
      existingSuperAdmin.email = email;
      existingSuperAdmin.fullName = fullName;
      existingSuperAdmin.password = password;
      existingSuperAdmin.isActive = true;
      await existingSuperAdmin.save();
      console.log(`Superadmin account verified and updated (${email}).`);
      await mongoose.disconnect();
      return;
    }

    const superAdminUser = await User.create({
      fullName,
      nic: '000000000001',
      email,
      phone: '0710000001',
      password,
      district: 'Colombo',
      role: 'superadmin',
      isActive: true,
    });

    console.log(`Superadmin account created with ID: ${superAdminUser._id}`);
  } catch (error) {
    console.error('Failed to seed superadmin user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedSuperAdmin();
