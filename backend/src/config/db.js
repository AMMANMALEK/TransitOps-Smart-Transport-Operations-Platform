const mongoose = require('mongoose');
const User = require('../features/auth/user.model');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transitops');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial Admin user if no users exist
    await seedAdminUser();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdminUser = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Seeding initial admin user...');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@transitops.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      const adminUser = new User({
        name: 'System Admin',
        email: adminEmail.toLowerCase(),
        passwordHash: adminPassword, // Will be hashed by pre-save hook
        role: 'Admin'
      });
      
      await adminUser.save();
      console.log(`Admin user seeded successfully with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`Error seeding admin user: ${error.message}`);
  }
};

module.exports = connectDB;
