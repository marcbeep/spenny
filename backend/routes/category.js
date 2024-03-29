const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  addCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.use(requireAuth);

router.post('/', addCategory);
router.get('/', getCategories);
router.get('/:id', getSingleCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
