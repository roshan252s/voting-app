const express = require('express')
const router = express.Router()


const User = require('../models/user')


const { jwtAuthMiddleware, generateToken } = require('../jwt')
const Candidate = require('../models/candidate')


//Creating a new user
router.post('/signup', async (req, res) => {
    try {

        //Check if Admin already exists. 
        const hasAdmin = await User.findOne({ role: "admin" })
        const { role } = await req.body
        if (hasAdmin && role == "admin") return res.status(500).json("Admin already exists")


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


//Login user
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

//Get profile of the user
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

//Change password of the user
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

//Voting the candidate by the user.
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const id = req.user.id
        const user = await User.findById(id)

        if (!user) return res.status(404).json("Invalid user")
        if (user.role == "admin") return res.status(500).json("Admin are not allowed to vote.")
        if (user.isVoted) return res.status(500).json("You have already voted.")

        const candidateId = req.params.candidateId
        const candidate = await Candidate.findById(candidateId)
        
        if (!candidate) return res.status(404).json("Invalid candidate")

        candidate.votes.push({user:id})
        candidate.voteCount++
        await candidate.save()

        user.isVoted = true
        await user.save()

        res.status(200).json({ message: "vote recorded successfully" })

    } catch (error) {
        res.status(500).json({ message: "Server Error found" })
    }
})



module.exports = router
