const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// add user
// router.post('/register', async (req, res) => {
//   const { username, password, fname, lname, email, role } = req.body;
//   try {
//     const user = await User.create({ username, password, fname, lname, email, role });
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

////////////////////////////////////// login //////////////////////////////////////
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // สร้าง JWT Token
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role, team_id: user.team_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role, team_id: user.team_id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// ดู all user //////////////////////////////////////
router.get('/users', protect, authorize(['Admin']), async (req, res) => {
    try {
      const users = await User.find().select('-password'); // ไม่ส่งคืนรหัสผ่าน
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });  

////////////////////////////////////// create user //////////////////////////////////////
router.post("/users", protect, authorize(["Admin"]), async (req, res) => {
  const { username, password, role, fname, lname, email } = req.body;
  try {
    const user = await User.create({ username, password, role, fname, lname, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// edit user //////////////////////////////////////
router.put("/users/:id", protect, authorize(["Admin"]), async (req, res) => {
  const { fname, lname, email, role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { fname, lname, email, role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// del user //////////////////////////////////////
router.delete("/users/:id", protect, authorize(["Admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////// find fname user //////////////////////////////////////
router.get("/users/:fname", protect, authorize(["Admin"]), async (req, res) => {
    try {
        const fname = await User.find({
            fname: { $regex: req.params.fname, $options: "i" }
        });

        if (fname.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(fname);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

////////////////////////////////////////////////////////////////////////////

module.exports = router;