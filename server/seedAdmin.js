// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '.env') });
// const mongoose = require('mongoose');
// const User = require('./models/User');

// const seedAdmin = async () => {
//   try {
//     const mongoUri = process.env.MONGO_URI;
//     if (!mongoUri) {
//       throw new Error('MONGO_URI is not defined in environment variables.');
//     }

//     await mongoose.connect(mongoUri);

//     const existingAdmin = await User.findOne({ email: 'admin@welfai.com' });
//     if (existingAdmin) {
//       existingAdmin.password = 'Admin@123';
//       existingAdmin.isActive = true;
//       await existingAdmin.save();
//       console.log('Admin account verified and updated (admin@welfai.com).');
//       await mongoose.disconnect();
//       return;
//     }

//     const adminUser = await User.create({
//       fullName: 'System Administrator',
//       nic: '000000000000',
//       email: 'admin@welfai.com',
//       phone: '0710000000',
//       password: 'Admin@123',
//       district: 'Colombo',
//       role: 'admin',
//       isActive: true,
//     });

//     console.log(`Admin account created with ID: ${adminUser._id}`);
//   } catch (error) {
//     console.error('Failed to seed admin user:', error.message);
//   } finally {
//     await mongoose.disconnect();
//   }
// };

// seedAdmin();
