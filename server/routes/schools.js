const express = require('express')
const router  = express.Router()
const School  = require('../models/School')

// POST /api/schools — save a new analysis
router.post('/', async (req, res) => {
  try {
    const school = new School(req.body)
    const saved  = await school.save()
    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// GET /api/schools — get all submissions (newest first)
router.get('/', async (req, res) => {
  try {
    const schools = await School.find().sort({ submittedAt: -1 })
    res.json({ success: true, data: schools })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/schools/:udise — lookup by UDISE code
router.get('/:udise', async (req, res) => {
  try {
    const schools = await School.find({ udise: req.params.udise }).sort({ submittedAt: -1 })
    if (!schools.length) return res.status(404).json({ success: false, error: 'No records found for this UDISE code.' })
    res.json({ success: true, data: schools })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
