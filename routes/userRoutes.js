const express = require('express')
const router = express.Router()


const User = require('../models/user')


const { jwtAuthMiddleware, generateToken } = require('../jwt')



router.post('/signup', async (req, res) => {
    try {


        // const hasAdmin = await User.findOne({ role: "admin" })
        // res.status(200).json(hasAdmin)


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
        res.status(200).json({ user, token })
    } catch (error) {
        res.status(500).json({ message: "Server Error found" })
    }
})


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.id

        const user = await User.findById(userId)
        if (!user) {
            res.status(500).json({ err: "User not found" })
        }
        res.status(200).json(user)

    } catch (err) {
        res.status(500).json({ err: "Internal server error" })
    }

})


router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {

    try {

        const userId = req.user.id
        console.log(userId);

        const { oldPassword, newPassword } = req.body

        const user = await User.findById(userId)

        if (!user || !(await user.comparePassword(oldPassword))) {
            res.status(500).json({ err: "Old password doesn't match" })
        }
        user.password = newPassword
        user.save()
        res.status(200).json({ success: "Password changed successfully" })

    } catch (error) {
        res.status(500).json({ err: "Internal server error" })

    }

})








module.exports = router
