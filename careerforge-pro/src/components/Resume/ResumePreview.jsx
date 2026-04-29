import { useSelector, useDispatch } from 'react-redux';
import { setTemplate } from '../../redux/resumeSlice';
import {
  Mail,
  Phone,
  MapPin,
  Link2,
  Globe,
  Lock,
  Download,
  ExternalLink,
} from 'lucide-react';
import './ResumePreview.css';

const TEMPLATES = [
  { id: 'classic', label: 'Classic', free: true },
  { id: 'modern', label: 'Modern', free: true },
  { id: 'minimal', label: 'Minimal', free: true },
  { id: 'executive', label: 'Executive', free: true },
  { id: 'creative', label: 'Creative', free: true },
];

export default function ResumePreview() {
  const dispatch = useDispatch();
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    selectedTemplate,
    keywords,
  } = useSelector((state) => state.resume);

  const allKeywords = [
    ...(keywords.hard_skills || []),
    ...(keywords.soft_skills || []),
    ...(keywords.tools || []),
    ...(keywords.top_keywords || []),
  ].map((k) => k.toLowerCase());

  /* Highlight keywords in text */
  const highlightText = (text) => {
    if (!text || allKeywords.length === 0) return text;
    const escaped = allKeywords.map((k) =>
      k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      allKeywords.includes(part.toLowerCase()) ? (
        <mark key={i} className="rp-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleDownload = () => {
    window.print();
  };

  const hasContact =
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.location ||
    personalInfo.linkedin;

  const isEmpty =
    !personalInfo.firstName &&
    !personalInfo.lastName &&
    experience.length === 0 &&
    education.length === 0;

  return (
    <div className="rp" id="resume-preview">
      {/* Template selector + Download */}
      <div className="rp-toolbar">
        <div className="rp-templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`rp-template-btn ${selectedTemplate === t.id ? 'rp-template-btn--active' : ''} ${!t.free ? 'rp-template-btn--locked' : ''}`}
              onClick={() => t.free && dispatch(setTemplate(t.id))}
              title={t.free ? t.label : `${t.label} (Pro)`}
            >
              {t.label}
              {!t.free && <Lock size={10} />}
            </button>
          ))}
        </div>
        <button className="rp-download-btn" onClick={handleDownload}>
          <Download size={15} /> PDF
        </button>
      </div>

      {/* Resume paper */}
      <div className={`rp-paper rp-paper--${selectedTemplate}`} id="resume-paper">
        {/* A4 page boundary indicator */}
        <div className="rp-page-boundary" />

        {isEmpty ? (
          <div className="rp-empty">
            <p className="rp-empty__title">Your resume will appear here</p>
            <p className="rp-empty__sub">
              Start filling in the form on the left to see a live preview.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Name + Job Title */}
            <div className="rp-name-block">
              <h1 className="rp-name">
                {personalInfo.firstName} {personalInfo.lastName}
              </h1>
              {personalInfo.jobTitle && (
                <p className="rp-jobtitle">{personalInfo.jobTitle}</p>
              )}
            </div>

            {/* 2. Contact row */}
            {hasContact && (
              <div className="rp-contact">
                {personalInfo.email && (
                  <span className="rp-contact__item">
                    <Mail size={12} /> {personalInfo.email}
                  </span>
                )}
                {personalInfo.phone && (
                  <span className="rp-contact__item">
                    <Phone size={12} /> {personalInfo.phone}
                  </span>
                )}
                {personalInfo.location && (
                  <span className="rp-contact__item">
                    <MapPin size={12} /> {personalInfo.location}
                  </span>
                )}
                {personalInfo.linkedin && (
                  <span className="rp-contact__item">
                    <Link2 size={12} /> {personalInfo.linkedin}
                  </span>
                )}
                {personalInfo.github && (
                  <span className="rp-contact__item">
                    <Globe size={12} /> {personalInfo.github}
                  </span>
                )}
              </div>
            )}

            {/* 3. Divider */}
            <hr className="rp-divider" />

            {/* 4. Summary */}
            {personalInfo.summary && (
              <div className="rp-section">
                <h2 className="rp-section__title">Professional Summary</h2>
                <p className="rp-section__body rp-summary">
                  {highlightText(personalInfo.summary)}
                </p>
              </div>
            )}

            {/* 5. Experience */}
            {experience.length > 0 && (
              <div className="rp-section">
                <h2 className="rp-section__title">Experience</h2>
                {experience.map((exp) => (
                  <div className="rp-item" key={exp.id}>
                    <div className="rp-item__row">
                      <div>
                        <strong className="rp-item__primary">
                          {exp.position || 'Position'}
                        </strong>
                        <span className="rp-item__secondary">
                          {exp.company && ` at ${exp.company}`}
                        </span>
                      </div>
                      <span className="rp-item__dates">
                        {exp.startDate || 'Start'} &mdash;{' '}
                        {exp.current ? 'Present' : exp.endDate || 'End'}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="rp-item__location">{exp.location}</p>
                    )}
                    {exp.description && (
                      <ul className="rp-bullets">
                        {exp.description.split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{highlightText(line)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 6. Education */}
            {education.length > 0 && (
              <div className="rp-section">
                <h2 className="rp-section__title">Education</h2>
                {education.map((edu) => (
                  <div className="rp-item" key={edu.id}>
                    <div className="rp-item__row">
                      <div>
                        <strong className="rp-item__primary">
                          {edu.degree || 'Degree'}
                        </strong>
                        {edu.fieldOfStudy && (
                          <span className="rp-item__secondary">
                            {' '}in {edu.fieldOfStudy}
                          </span>
                        )}
                      </div>
                      <span className="rp-item__dates">
                        {edu.startDate || ''} &mdash; {edu.endDate || ''}
                      </span>
                    </div>
                    <p className="rp-item__location">
                      {edu.institution}
                      {edu.gpa && ` | GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 7. Skills */}
            {(skills.technical.length > 0 ||
              skills.soft.length > 0 ||
              skills.tools.length > 0) && (
              <div className="rp-section">
                <h2 className="rp-section__title">Skills</h2>
                <div className="rp-skills">
                  {skills.technical.length > 0 && (
                    <div className="rp-skills__group">
                      <span className="rp-skills__label">Technical:</span>
                      <div className="rp-skills__chips">
                        {skills.technical.map((s, i) => (
                          <span key={i} className="rp-chip">
                            {highlightText(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skills.soft.length > 0 && (
                    <div className="rp-skills__group">
                      <span className="rp-skills__label">Soft Skills:</span>
                      <div className="rp-skills__chips">
                        {skills.soft.map((s, i) => (
                          <span key={i} className="rp-chip">
                            {highlightText(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skills.tools.length > 0 && (
                    <div className="rp-skills__group">
                      <span className="rp-skills__label">Tools:</span>
                      <div className="rp-skills__chips">
                        {skills.tools.map((s, i) => (
                          <span key={i} className="rp-chip">
                            {highlightText(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. Projects */}
            {projects.length > 0 && (
              <div className="rp-section">
                <h2 className="rp-section__title">Projects</h2>
                {projects.map((proj) => (
                  <div className="rp-item" key={proj.id}>
                    <div className="rp-item__row">
                      <strong className="rp-item__primary">
                        {proj.name || 'Project Name'}
                      </strong>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="rp-item__link"
                        >
                          <ExternalLink size={11} /> Link
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="rp-item__desc">
                        {highlightText(proj.description)}
                      </p>
                    )}
                    {proj.techStack && (
                      <p className="rp-item__tech">
                        <strong>Tech:</strong> {proj.techStack}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 9. Certifications */}
            {certifications.length > 0 && (
              <div className="rp-section">
                <h2 className="rp-section__title">Certifications</h2>
                {certifications.map((cert) => (
                  <div className="rp-item rp-item--inline" key={cert.id}>
                    <strong>{cert.name}</strong>
                    {cert.issuer && (
                      <span className="rp-item__secondary">
                        {' '}&mdash; {cert.issuer}
                      </span>
                    )}
                    {cert.date && (
                      <span className="rp-item__dates"> ({cert.date})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
