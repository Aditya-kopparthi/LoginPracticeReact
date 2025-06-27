const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Register Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log("📥 Request Received:", req.body);  // ✅ Log input

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists");
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    console.log("✅ User registered:", newUser);
    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    console.error("❌ Error in /api/register:", err); // ✅ Show real error
    res.json({ success: false, message: 'Registration failed', error: err.message });
  }
});


// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    res.json({ success: false, message: 'Login failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
