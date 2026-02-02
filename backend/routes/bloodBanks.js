const express = require('express');
const router = express.Router();
let Hospital;
let store;
const useInMemory = process.env.NO_DB === 'true';
if (useInMemory) {
  store = require('../inMemoryStore');
} else {
  Hospital = require('../models/Hospital');
}

// GET /api/blood-banks/test
router.get('/test', (req, res) => {
  res.json({ message: `Blood bank routes are working${useInMemory ? ' (in-memory)' : ''}!` });
});

// GET /api/blood-banks
router.get('/', async (req, res) => {
  try {
    if (useInMemory) {
      // return hospitals with simple inventory view
      const list = store.listAll().hospitals.map(h => ({ ...h, inventory: store.getInventoryForHospital(h.id) }));
      return res.json(list);
    }
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching blood banks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blood-banks/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (useInMemory) {
      const h = store.findHospitalById(id);
      if (!h) return res.status(404).json({ message: 'Blood bank not found' });
      return res.json({ ...h, inventory: store.getInventoryForHospital(h.id) });
    }
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }
    res.json(hospital);
  } catch (error) {
    console.error('Error fetching blood bank:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
