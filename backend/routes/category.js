const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(requireAuth);

// Routes for categories
router.post('/', addCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
