const express = require('express')
const router = express.Router()


const Candidate = require('../models/candidate')


const { jwtAuthMiddleware } = require('../jwt')
const User = require('../models/user')


//Function to check if it's admin or not.
const checkAdmin = async (userId) => {
    try {
        const user = await User.findById(userId)
        return user.role == "admin"

    } catch (error) {
        return false
    }
}

//To see all the candidates
router.get('/', async (req, res) => {

    try {
        const candidate = await Candidate.find()
        if (!candidate) {
            res.status(401).json("This doesn't exist.")
        }
        if (candidate.length == 0) {
            res.status(401).json("No candidate found")
        }
        res.status(200).json(candidate)


    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Internal server error" })

    }

})


//To add a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {

    try {
        const userId = req.user.payload.id

        if (checkAdmin(userId)) {
            const candidate = req.body
            console.log(candidate);

            const newCandidate = new Candidate(candidate)
            const response = await newCandidate.save()
            console.log(response);

            res.status(200).json(response)
        } else {
            res.status(401).json({ err: "You are not eligible for this" })
        }



    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Internal server error" })

    }

})

//To update an existing candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {

    try {
        const userId = req.user.payload.id

        const candidateId = req.params.candidateId

        if (!checkAdmin(userId)) return res.status(401).json({ err: "You are not eligible for this" })

        const updatedCandidateData = req.body

        const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        if (!updatedCandidate) {
            res.status(401).json("Candidate couldn't be updated.")
        }
        res.status(200).json("Candidate data updated.")

    } catch (error) {
        console.log(error);

        res.status(500).json({ err: "Internal server error" })

    }

})

//To delete an existing candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {

    try {
        const userId = req.user.payload.id
        const candidateId = req.params.candidateId

        if (!checkAdmin(userId)) return res.status(401).json({ err: "You are not eligible for this" })

        const candidate = await Candidate.findByIdAndDelete(candidateId)
        if (!candidate) {
            res.status(401).json("Candidate couldn't be deleted.")
        }
        res.status(200).json("Successfully deleted.")

    } catch (error) {
        console.log(error);

        res.status(500).json({ err: "Internal server error" })

    }

})







module.exports = router