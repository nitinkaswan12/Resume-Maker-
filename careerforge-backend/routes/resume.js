const express = require('express')
const router = express.Router()
const { generatePDF } = require('../services/puppeteerService')
const authMiddleware = require('../middleware/authMiddleware')
const Resume = require('../models/Resume')

// ROUTE 1 — GET /api/resume/all
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const resumes = await Resume.find({ user_id: userId });

    res.json(resumes)
  } catch (error) {
    console.error('Fetch resumes error:', error)
    res.status(500).json({ error: 'Failed to fetch resumes' })
  }
})

// ROUTE 2 — POST /api/resume/save
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { title, resumeData, atsScore, jobDescription } = req.body
    
    if (!resumeData) {
      return res.status(400).json({ error: 'resumeData is required' })
    }

    const newResume = await Resume.create({
      user_id: req.user._id,
      title: title || 'Untitled Resume',
      resume_data: resumeData,
      ats_score: atsScore || 0,
      job_description: jobDescription || ''
    });

    res.json(newResume)
  } catch (error) {
    console.error('Save resume error:', error)
    res.status(500).json({ error: 'Failed to save resume' })
  }
})

// ROUTE 3 — PUT /api/resume/update/:id
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { resumeData, atsScore, title, jobDescription } = req.body

    const updateFields = {};
    if (resumeData !== undefined) updateFields.resume_data = resumeData;
    if (atsScore !== undefined) updateFields.ats_score = atsScore;
    if (title !== undefined) updateFields.title = title;
    if (jobDescription !== undefined) updateFields.job_description = jobDescription;

    const updatedResume = await Resume.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' })
    }

    res.json(updatedResume)
  } catch (error) {
    console.error('Update resume error:', error)
    res.status(500).json({ error: 'Failed to update resume' })
  }
})

// ROUTE 4 — DELETE /api/resume/delete/:id
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const deletedResume = await Resume.findOneAndDelete({ _id: id, user_id: req.user._id });

    if (!deletedResume) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Delete resume error:', error)
    res.status(500).json({ error: 'Failed to delete resume' })
  }
})

// ROUTE 5 — POST /api/resume/generate-pdf
router.post('/generate-pdf', authMiddleware, async (req, res) => {
  try {
    const { resumeHTML } = req.body
    if (!resumeHTML) {
      return res.status(400).json({ error: 'resumeHTML is required' })
    }

    const pdfBuffer = await generatePDF(resumeHTML)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf')
    
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Generate PDF error:', error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

module.exports = router
