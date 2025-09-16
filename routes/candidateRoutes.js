const express = require('express')
const router = express.Router()


const Candidate = require('../models/candidate')


const { jwtAuthMiddleware } = require('../jwt')
const User = require('../models/user')


//Function to check if it's admin or not.

const checkAdmin = async (id) => {

    try {
        const user = await User.findById(id)
        const role = user.role

        if (!user || role == "voter") {
            return false
        } else {
            return true
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Internal server error" })
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

//To see all the candidate votes
router.get('/vote', async (req, res) => {
    try {

        //Find all the candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount:"desc"})
        if (!candidate) {
            res.status(401).json("This doesn't exist.")
        }
        if (candidate.length == 0) {
            res.status(401).json("No candidate found")
        }

        //Map only speciefic data of the candidates
        const record = candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        })
       
        res.status(200).json(record)


    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Internal server error" })

    }

})


//To add a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {

    try {
        const id = req.user.id

        if (!(await checkAdmin(id))) return res.status(401).json({ err: "You are not eligible to add the candidate." })

        const candidateData = req.body
        const newCandidate = new Candidate(candidateData)
        const response = await newCandidate.save()
        res.status(200).json(response)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Internal server error" })

    }

})

//To update an existing candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {

    try {
        const id = req.user.id

        const candidateId = req.params.candidateId

        if (!(await checkAdmin(id))) return res.status(401).json({ err: "You are not eligible to update the candidate." })

        const updatedCandidateData = req.body

        const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        if (!updatedCandidate) {
            res.status(401).json("Candidate couldn't be updated.")
        }
        res.status(200).json(updatedCandidate)

    } catch (error) {
        console.log(error);

        res.status(500).json({ err: "Internal server error" })

    }

})

//To delete an existing candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {

    try {
        const id = req.user.id
        const candidateId = req.params.candidateId

        if (!(await checkAdmin(id))) return res.status(401).json({ err: "You are not eligible to delete the candidate." })

        const candidate = await Candidate.findByIdAndDelete(candidateId)
        if (!candidate) {
            res.status(401).json("Candidate couldn't be deleted.")
        }
        res.status(200).json("candidate deleted")

    } catch (error) {
        console.log(error);

        res.status(500).json({ err: "Internal server error" })

    }

})


module.exports = router