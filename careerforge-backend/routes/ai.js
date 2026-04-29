const express = require('express')
const router = express.Router()
const { extractKeywords, rewriteResume, generateCoverLetter } = require('../services/geminiService')

router.post('/extract-keywords', async (req, res) => {
  try {
    const { jobDescription } = req.body
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description required' })
    }
    const keywords = await extractKeywords(jobDescription)
    res.json({ success: true, keywords })
  } catch (error) {
    console.error('Extract keywords error:', error)
    res.status(500).json({ error: 'Failed to extract keywords' })
  }
})

router.post('/rewrite-resume', async (req, res) => {
  try {
    const { resumeData, keywords, jobDescription } = req.body
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ error: 'Resume data and JD required' })
    }
    const rewritten = await rewriteResume(resumeData, keywords, jobDescription)
    res.json({ success: true, resume: rewritten })
  } catch (error) {
    console.error('Rewrite error:', error)
    res.status(500).json({ error: 'Failed to rewrite resume' })
  }
})

router.post('/cover-letter', async (req, res) => {
  try {
    const { resumeData, jobDescription, keywords } = req.body
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ error: 'Resume data and JD required' })
    }
    const letter = await generateCoverLetter(resumeData, jobDescription, keywords)
    res.json({ success: true, coverLetter: letter })
  } catch (error) {
    console.error('Cover letter error:', error)
    res.status(500).json({ error: 'Failed to generate cover letter' })
  }
})

function calculateATSScore(resumeData, keywords) {
  const summaryText = resumeData.personalInfo?.summary || '';
  // Use description field as that's what's currently in Redux store for experience
  const experienceBullets = resumeData.experience?.map(e => e.description || '').join(' ') || '';
  const allText = [
    summaryText,
    experienceBullets,
    resumeData.skills?.technical?.join(' ') || '',
    resumeData.skills?.soft?.join(' ') || '',
    resumeData.skills?.tools?.join(' ') || ''
  ].join(' ').toLowerCase();

  const suggestions = [];
  let score = 0;

  // 1. Keywords Match (Max 40 points)
  const topKeywords = keywords.top_keywords || [];
  const hardSkills = keywords.hard_skills || [];
  const allKeywords = [...new Set([...topKeywords, ...hardSkills])];
  
  const matched = allKeywords.filter(k => allText.includes(k.toLowerCase()));
  const missing = allKeywords.filter(k => !allText.includes(k.toLowerCase()));

  const keywordScore = allKeywords.length > 0 ? (matched.length / allKeywords.length) * 40 : 40;
  score += keywordScore;
  if (keywordScore < 30 && missing.length > 0) {
    suggestions.push(`Add missing keywords from JD: ${missing.slice(0, 3).join(', ')}`);
  }

  // 2. Quantifying Impact (Max 20 points)
  const hasNumbers = /\d+%|\$\d+|\d+/.test(experienceBullets);
  if (hasNumbers) {
    score += 20;
  } else if (resumeData.experience?.length > 0) {
    suggestions.push('Quantify your impact in the experience section using numbers, percentages, or dollar amounts.');
  } else {
    score += 10;
  }

  // 3. Essential Sections (Max 15 points)
  let sectionsScore = 0;
  if (resumeData.personalInfo?.email) sectionsScore += 3;
  else suggestions.push('Add your email address to contact information.');
  
  if (resumeData.personalInfo?.phone) sectionsScore += 3;
  else suggestions.push('Add your phone number to contact information.');
  
  if (resumeData.experience?.length > 0) sectionsScore += 5;
  else suggestions.push('Add at least one work experience.');
  
  if (resumeData.education?.length > 0) sectionsScore += 4;
  else suggestions.push('Add your education history.');
  
  score += sectionsScore;

  // 4. Resume Length & Formatting (Max 15 points)
  const wordCount = allText.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 800) {
    score += 15;
  } else if (wordCount < 200) {
    score += 5;
    suggestions.push('Your resume is too short. Try to expand on your experience and skills.');
  } else {
    score += 10;
    suggestions.push('Your resume is too long. Keep it concise and ideally under 800 words.');
  }

  // 5. Buzzwords and Cliches (Max 10 points)
  const cliches = ['team player', 'hard worker', 'detail-oriented', 'think outside the box', 'go-getter', 'synergy'];
  const foundCliches = cliches.filter(c => allText.includes(c));
  if (foundCliches.length === 0) {
    score += 10;
  } else {
    suggestions.push(`Avoid cliches and buzzwords like: ${foundCliches.join(', ')}.`);
  }

  // 6. Action Verbs Check (Suggestions only)
  const actionVerbs = ['managed', 'led', 'developed', 'created', 'designed', 'improved', 'increased', 'reduced', 'spearheaded', 'implemented'];
  const hasActionVerbs = actionVerbs.some(v => allText.includes(v));
  if (!hasActionVerbs && resumeData.experience?.length > 0) {
    suggestions.push('Start your experience bullet points with strong action verbs (e.g., Managed, Developed, Spearheaded).');
  }

  score = Math.round(score);
  score = Math.min(100, Math.max(0, score));

  return { score, matched, missing, suggestions };
}

router.post('/ats-score', (req, res) => {
  try {
    const { resumeData, keywords } = req.body
    if (!resumeData || !keywords) {
      return res.status(400).json({ error: 'Resume data and keywords required' })
    }
    const result = calculateATSScore(resumeData, keywords)
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('ATS score error:', error)
    res.status(500).json({ error: 'Failed to calculate ATS score' })
  }
})

module.exports = router
