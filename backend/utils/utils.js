const mongoose = require('mongoose');

exports.checkOwnership = (doc, userId) => {
  if (!doc) return false;
  // Ensure we are comparing strings, as doc.user might be an ObjectId
  return doc.user.toString() === userId.toString();
};
