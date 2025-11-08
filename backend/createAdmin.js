const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('Admin user already exists!');
    console.log('Email: admin@example.com');
    process.exit(0);
  }
  
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  
  await admin.save();
  console.log('Admin user created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
  console.log('\n⚠️  Please change the password after first login!');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

