const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            required:true,
        },
        transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        },
        ],
    },
    { timestamps: true }
    );

    module.exports = mongoose.model('Account', accountSchema);
