const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
function readData() {
  const raw = fs.readFileSync(DATA_PATH);
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', (req, res, next) => {
  try {
    const data = readData();
    const { page = 1, limit = 20, q } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let results = data;

    if (q) {
      const query = q.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(offset, offset + limitNum);

    res.json({
      items: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', (req, res, next) => {
  try {
    const data = readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;