const express = require('express');
const router = express.Router();
const store = require('../inMemoryStore');

const useInMemory = true;

// GET /api/donors/test
router.get('/test', (req, res) => {
  res.json({ message: 'Donor routes are working!' });
});

// GET /api/donors
router.get('/', async (req, res) => {
  try {
    const data = store.listAll();
    const list = data.donors || [];
    // sort by name
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(list);
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/donors/:id
router.get('/:id', async (req, res) => {
  try {
    const donor = store.findDonorById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
