const mongoose = require('mongoose')
require('dotenv').config();


const LOCAL_URL = process.env.MONGO_URL_LOCAL
mongoose.connect(LOCAL_URL)

const db = mongoose.connection

db.on('connected', () => {
    console.log('Mongodb connected to server');
})

db.on('disconnected', () => {
    console.log('Mongodb disconnected');
})

db.on('error', () => {
    console.log('Connection error');
})