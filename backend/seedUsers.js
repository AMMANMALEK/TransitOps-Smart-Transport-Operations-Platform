const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/features/auth/user.model');

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@transitops.com',
    password: 'Admin@123',
    role: 'Admin'
  },
  {
    name: 'Rahul Sharma',
    email: 'fleet@transitops.com',
    password: 'Fleet@123',
    role: 'FleetManager'
  },
  {
    name: 'Dev Mehta',
    email: 'driver@transitops.com',
    password: 'Driver@123',
    role: 'Driver'
  },
  {
    name: 'Priya Nair',
    email: 'safety@transitops.com',
    password: 'Safety@123',
    role: 'SafetyOfficer'
  },
  {
    name: 'Meera Kapoor',
    email: 'finance@transitops.com',
    password: 'Finance@123',
    role: 'FinancialAnalyst'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Create users with hashed passwords
    for (const userData of SEED_USERS) {
      const { password, ...userInfo } = userData;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create user
      const user = await User.create({
        ...userInfo,
        passwordHash
      });
      
      console.log(`✓ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\n✅ All users created successfully!\n');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════════════════════════');
    SEED_USERS.forEach(user => {
      console.log(`Email: ${user.email.padEnd(30)} Password: ${user.password.padEnd(15)} Role: ${user.role}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

seedUsers();
