require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
require('./db')

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const userRoutes = require('./routes/userRoutes')
app.use('/user',userRoutes)


const candidateRoutes = require('./routes/candidateRoutes')
app.use('/candidate', candidateRoutes)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})