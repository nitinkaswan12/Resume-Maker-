const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function extractKeywords(jobDescription) {
  const prompt = `You are an expert ATS analyst.
Analyze this Job Description and extract important keywords.

Return ONLY a valid JSON object in this exact format, 
no extra text, no markdown:
{
  "hard_skills": [],
  "soft_skills": [],
  "tools": [],
  "qualifications": [],
  "top_keywords": []
}

Job Description:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
  return JSON.parse(clean);
}

async function rewriteResume(resumeData, keywords, jobDescription) {
  const mergedKeywords = [...(keywords.top_keywords || []), ...(keywords.hard_skills || []), ...(keywords.soft_skills || [])];
  
  const prompt = `You are an expert resume writer with 10+ years experience.

Rewrite the bullet points in this resume to:
1. Start each bullet with a strong past-tense action verb
2. Naturally include these keywords: ${mergedKeywords.join(', ')}
3. Add quantifiable achievements (%, numbers, impact)
4. Match the tone of the job description
5. Keep it truthful — only enhance, never fabricate
6. Maximum 2 lines per bullet point

Rules:
- Return ONLY valid JSON, no markdown, no extra text
- Keep exact same JSON structure as input
- Only rewrite the bullets and summary fields
- Do not change personal info, education, dates

Current Resume:
${JSON.stringify(resumeData)}

Job Description:
${jobDescription}

Return the complete updated resume JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
  return JSON.parse(clean);
}

async function generateCoverLetter(resumeData, jobDescription, keywords) {
  const mergedKeywords = [...(keywords.top_keywords || []), ...(keywords.hard_skills || []), ...(keywords.soft_skills || [])];

  const prompt = `You are an expert cover letter writer.
Write a professional cover letter for this candidate.

Rules:
- Exactly 3 paragraphs
- Paragraph 1: Who you are + why this role excites you
- Paragraph 2: Top 2-3 achievements with numbers
- Paragraph 3: Why this company + call to action
- Naturally include these keywords: ${mergedKeywords.join(', ')}
- Do NOT start with "I am writing to..."
- Do NOT use "team player" or "hard worker"
- Tone: Professional but warm
- Return plain text only, no markdown

Candidate Info:
${JSON.stringify(resumeData.personalInfo)}

Experience:
${JSON.stringify(resumeData.experience)}

Job Description:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function parseResume(pdfText) {
  const prompt = `You are an expert resume parser.
Extract the structured data from the following resume text.

Return ONLY a valid JSON object in this exact format, no markdown, no extra text:
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "summary": ""
  },
  "experience": [
    {
      "id": "exp_1",
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "",
      "degree": "",
      "fieldOfStudy": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": []
  },
  "projects": [
    {
      "id": "proj_1",
      "name": "",
      "description": "",
      "techStack": "",
      "link": ""
    }
  ]
}

If a field is missing, leave it empty.
For description in experience, keep it as a paragraph or bullet points separated by newlines.

Resume Text:
${pdfText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { extractKeywords, rewriteResume, generateCoverLetter, parseResume };
