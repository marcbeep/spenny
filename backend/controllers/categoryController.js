const mongoose = require('mongoose');

/**
 * Creates a new category for the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.addCategory = async (req, res) => {
  const { title } = req.body; // Only accept title for category creation

  try {
    const category = await Category.create({
      user: req.user._id,
      title,
      assignedAmount: 0,
      available: 0,
      activity: 0,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
};

/**
 * Retrieves all categories associated with the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Retrieves a single category by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getSingleCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const category = await Category.findById(id);
    if (!category) return handleNoCategoryFound(res);
    res.status(200).json(category);
  } catch (err) {
    return handleNoCategoryFound(res);
  }
};

/**
 * Deletes a category by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const result = await Category.findByIdAndDelete(id);
    if (!result) return handleNoCategoryFound(res);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
};

/**
 * Updates the title of a category by its ID.
 * This operation is designed to only affect the category's name,
 * ensuring no impact on budget-related properties.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true });

    if (!updatedCategory) return handleNoCategoryFound(res);
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
};
