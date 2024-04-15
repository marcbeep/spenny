const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  addCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  categoryTable
} = require('../controllers/categoryController');

const router = express.Router();

router.use(requireAuth);

router.get('/categoryTable', categoryTable);
router.get('/', getCategories);
router.get('/:id', getSingleCategory);
router.patch('/:id', updateCategory);
router.post('/', addCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
