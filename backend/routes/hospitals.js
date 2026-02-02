const express = require('express');
const router = express.Router();
const store = require('../inMemoryStore');

const useInMemory = true;

// GET /api/hospitals/test
router.get('/test', (req, res) => {
  res.json({ message: 'Hospital routes are working!' });
});

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const data = store.listAll();
    const list = data.hospitals || [];
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    // attach inventory
    const withInv = list.map(h => ({ ...h, inventory: store.getInventoryForHospital(h.id) }));
    res.json(withInv);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const hospital = store.findHospitalById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json({ ...hospital, inventory: store.getInventoryForHospital(hospital.id) });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
