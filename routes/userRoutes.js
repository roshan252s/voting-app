const express = require('express')
const router = express.Router()


const User = require('../models/user')


const { jwtAuthMiddleware, generateToken } = require('../jwt')



router.post('/signup', async (req, res) => {
    try {
        const userData = await req.body
        const newUser = new User(userData)

        const response = await newUser.save()
        const payload = {
            id: response.id
        }
        const token = generateToken(payload)
        res.status(200).json({ response, token })

    } catch (err) {
        console.log("Error")
        res.status(500).json({ err: "Internal server error" })
    }
})

router.post('/login', async (req, res) => {
    const { nid, password } = req.body

    try {
        const user = await User.findOne({ nid })
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ Error: "Incorrect username or password" })
        }

        const token = generateToken(user.id)
        res.status(200).json(token)
    } catch (error) {
        res.status(500).json({ message: "Server Error found" })
    }
})


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {

        const tokenId = req.user.payload.id
        const user = await User.findById(tokenId)
        if (!user) {
            res.status(500).json({ err: "No user found" })
        }

        res.status(200).json(user)

    } catch (err) {
        res.status(500).json({ err: "Internal server error" })
    }

})


router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {

    try {

        const tokenId = req.user.payload.id
        const { oldPassword, newPassword } = req.body

        const user = await User.findById(tokenId)

        if (!(await user.comparePassword(oldPassword))) {
            res.status(500).json({ err: "Old password doesn't match" })
        }
         user.password = newPassword
         user.save()
         res.status(200).json({success:"Password changed successfully"})

    } catch (error) {
        res.status(500).json({ err: "Internal server error" })

    }

})








module.exports = router
