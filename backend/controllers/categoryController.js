const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

const handleNoCategoryFound = (res) => res.status(404).json({ error: 'Category not found' });

exports.addCategory = async (req, res) => {
  try {
    const category = await Category.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSingleCategory = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return handleNoCategoryFound(res);
    res.status(200).json(category);
  } catch (err) {
    return handleNoCategoryFound(res);
  }
};

exports.deleteCategory = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    if (!result) return handleNoCategoryFound(res);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return handleNoCategoryFound(res);
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
