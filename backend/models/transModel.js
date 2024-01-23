const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', transSchema)
