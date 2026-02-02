const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../inMemoryStore');

// ensure demo accounts exist
store.ensureSampleUsers().catch((err) => console.error('Sample user init error:', err));

// Simple test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working (in-memory)!' });
});

// POST /api/auth/register
// body: { role: 'donor'|'hospital', ...fields }
router.post('/register', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || (role !== 'donor' && role !== 'hospital')) {
      return res.status(400).json({ message: 'Role must be "donor" or "hospital"' });
    }

    // Hash password
    if (!req.body.password) return res.status(400).json({ message: 'Password is required' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);

    if (role === 'donor') {
      const email = req.body.email ? req.body.email.toLowerCase() : undefined;
      if (!email) return res.status(400).json({ message: 'Email is required for donor' });
      // check duplicate
      const existing = store.findDonorByEmail(email);
      if (existing) return res.status(409).json({ message: 'Donor with this email already exists' });

      const donorData = {
        ...req.body,
        id: req.body.id ? req.body.id.toUpperCase() : undefined,
        email,
        password: hashed
      };

      const donor = store.saveDonor(donorData);
      return res.status(201).json({ message: 'Donor registered (in-memory)', user: { id: donor.id, name: donor.name, email: donor.email, role: 'donor' } });
    }

    if (role === 'hospital') {
      const id = req.body.id ? req.body.id.toUpperCase() : undefined;
      if (!id) return res.status(400).json({ message: 'Hospital ID is required' });
      const existing = store.findHospitalById(id);
      if (existing) return res.status(409).json({ message: 'Hospital with this ID already exists' });

      const hospitalData = {
        ...req.body,
        id,
        email: req.body.email ? req.body.email.toLowerCase() : undefined,
        password: hashed
      };

      const hospital = store.saveHospital(hospitalData);
      return res.status(201).json({ message: 'Hospital registered (in-memory)', user: { id: hospital.id, name: hospital.name, email: hospital.email, role: 'hospital' } });
    }

  } catch (error) {
    console.error('Auth register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
// body: { role: 'donor'|'hospital', identifier: email|id, password }
router.post('/login', async (req, res) => {
  try {
    const { role, identifier, password } = req.body;
    if (!role || (role !== 'donor' && role !== 'hospital')) {
      return res.status(400).json({ message: 'Role must be "donor" or "hospital"' });
    }
    if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password are required' });

    let user;
    if (role === 'donor') {
      user = store.findDonorByEmail(identifier.toLowerCase());
    } else {
      user = store.findHospitalById(identifier.toUpperCase());
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id || user.email, role };
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    const baseUser = { id: user.id, name: user.name || user.email, email: user.email, role };
    if (role === 'donor') baseUser.bloodGroup = user.bloodGroup || null;
    if (role === 'hospital') baseUser.inventory = store.getInventoryForHospital(user.id) || {};
    return res.json({ message: 'Login successful', token, user: baseUser });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
