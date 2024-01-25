const Transaction = require('../models/transModel')

const mongoose = require('mongoose')

// get all transactions

const getAllTransactions = async (req, res) => {
    try{
        const allTrans = await Transaction.find({}).sort({createdAt: -1})
        return res.status(200).json(allTrans)
    }catch(err){
        res.status(400).json({error: err.message})
    }
}

// get a single transaction

const getSingleTransaction = async (req, res) => { 
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({error: 'No transaction found'})   

    try{
        const singleTrans = await Transaction.findById(req.params.id)
        return res.status(200).json(singleTrans)
    }catch(err){
        return res.status(404).json({error: 'No transaction found'})
    }
}

// create new transaction

const createTransaction = async (req, res) => {
    const {title, amount} = req.body
    
    try{
        const newTrans = await Transaction.create({
            title,
            amount
        })
        return res.status(200).json(newTrans)
    }catch(err){
        res.status(400).json({error: err.message})
    }
}

// delete a single transaction

// update a single transaction

module.exports = {
    createTransaction,
    getAllTransactions,
    getSingleTransaction
}