/* ───────────────────────────────────────────────
   atsScorer.js — Client-side ATS Score Calculator
   ─────────────────────────────────────────────── */

/**
 * Flatten the entire resumeData object into a single lowercase string
 * for keyword matching.  Handles nested objects, arrays, and primitives.
 */
function flattenToText(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) return obj.map(flattenToText).join(' ');
  if (typeof obj === 'object') {
    return Object.values(obj).map(flattenToText).join(' ');
  }
  return '';
}

/**
 * Count words in a string.
 */
function wordCount(str) {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Check whether a keyword appears in the resume text.
 * Uses word-boundary matching so "React" doesn't match "Reactive"
 * unless "Reactive" is the actual keyword.
 */
function keywordInText(keyword, text) {
  // Escape regex special chars in the keyword
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
}

/* ═══════════════════════════════════════════════════
   Main scorer
   ═══════════════════════════════════════════════════ */

/**
 * calculateATSScore
 *
 * @param {Object} resumeData — Redux resume state shape:
 *   { personalInfo, experience[], education[], skills{}, projects[], certifications[] }
 *
 * @param {Object} keywords — Extracted JD keywords:
 *   { top_keywords[], hard_skills[], soft_skills[], tools[] }
 *
 * @returns {{ score: number, matched: string[], missing: string[], suggestions: string[] }}
 */
export function calculateATSScore(resumeData, keywords) {
  /* ── Guard clauses ── */
  if (!resumeData || !keywords) {
    return { score: 0, matched: [], missing: [], suggestions: ['Provide resume data and keywords to calculate score.'] };
  }

  /* ── 1. Build one lowercase text blob from the entire resume ── */
  const resumeText = flattenToText(resumeData).toLowerCase();

  /* ── 2. Collect ALL keyword lists into one de-duped set ── */
  const allKeywords = [
    ...(keywords.top_keywords || []),
    ...(keywords.hard_skills || []),
    ...(keywords.soft_skills || []),
    ...(keywords.tools || []),
  ];

  // De-dupe (case-insensitive) while preserving original casing
  const seen = new Set();
  const uniqueKeywords = allKeywords.filter((kw) => {
    const lower = kw.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  /* ── 3. Match each keyword ── */
  const matched = [];
  const missing = [];

  uniqueKeywords.forEach((kw) => {
    if (keywordInText(kw, resumeText)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const total = uniqueKeywords.length;

  /* ── 4. Base score (keyword match ratio × 70) ── */
  let baseScore = total > 0 ? (matched.length / total) * 70 : 0;

  /* ── 5. Bonus points ── */
  let bonus = 0;
  const suggestions = [];
  const { personalInfo, experience, skills } = resumeData || {};

  // +10 — Summary exists and is > 50 words
  const summaryWords = wordCount(personalInfo?.summary);
  if (summaryWords > 50) {
    bonus += 10;
  } else if (summaryWords > 0) {
    bonus += 4; // partial credit
    suggestions.push(
      `Expand your professional summary to 50+ words (currently ${summaryWords}). A detailed summary improves ATS matching.`
    );
  } else {
    suggestions.push(
      'Add a professional summary (50+ words) that includes key skills and your career objective.'
    );
  }

  // +10 — Experience has bullet points (descriptions with line breaks or length > 60)
  const hasGoodBullets = (experience || []).some((exp) => {
    const desc = exp.description || '';
    const lines = desc.split('\n').filter((l) => l.trim().length > 0);
    return lines.length >= 2 && desc.length > 60;
  });

  if (hasGoodBullets) {
    bonus += 10;
  } else if ((experience || []).length > 0) {
    bonus += 3; // partial credit for having experience at all
    suggestions.push(
      'Add detailed bullet points to your experience entries. Use multiple lines with quantified achievements.'
    );
  } else {
    suggestions.push(
      'Add work experience with detailed bullet points highlighting your accomplishments.'
    );
  }

  // +5 — Skills section has > 5 skills total
  const allSkills = [
    ...(skills?.technical || []),
    ...(skills?.soft || []),
    ...(skills?.tools || []),
  ];

  if (allSkills.length > 5) {
    bonus += 5;
  } else if (allSkills.length > 0) {
    bonus += 2;
    suggestions.push(
      `Add more skills (currently ${allSkills.length}). Aim for 6+ relevant skills to boost your ATS score.`
    );
  } else {
    suggestions.push(
      'Add technical skills, soft skills, and tools to your resume. ATS systems scan for specific skill keywords.'
    );
  }

  // +5 — Contact info is complete (name + email + phone + location)
  const hasName = !!(personalInfo?.firstName?.trim() && personalInfo?.lastName?.trim());
  const hasEmail = !!personalInfo?.email?.trim();
  const hasPhone = !!personalInfo?.phone?.trim();
  const hasLocation = !!personalInfo?.location?.trim();
  const contactFields = [hasName, hasEmail, hasPhone, hasLocation];
  const contactComplete = contactFields.every(Boolean);

  if (contactComplete) {
    bonus += 5;
  } else {
    const contactMissing = [];
    if (!hasName) contactMissing.push('full name');
    if (!hasEmail) contactMissing.push('email');
    if (!hasPhone) contactMissing.push('phone number');
    if (!hasLocation) contactMissing.push('location');
    bonus += contactFields.filter(Boolean).length; // 1pt per field
    suggestions.push(
      `Complete your contact information. Missing: ${contactMissing.join(', ')}.`
    );
  }

  /* ── 6. Add missing keyword suggestions ── */
  if (missing.length > 0) {
    const topMissing = missing.slice(0, 5).join(', ');
    suggestions.unshift(
      `Add these missing keywords to your resume: ${topMissing}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ''}.`
    );
  }

  /* ── 7. Final score (capped at 100) ── */
  const score = Math.min(100, Math.round(baseScore + bonus));

  return {
    score,
    matched,
    missing,
    suggestions,
  };
}

export default calculateATSScore;
