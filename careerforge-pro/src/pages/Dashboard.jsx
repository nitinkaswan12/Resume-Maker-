import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus, FileText, Mail, Pencil, Download, Trash2,
  FilePlus, Target, Crown, AlertTriangle,
  Zap, BarChart3, Check, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Shared/Navbar';
import './Dashboard.css';

/* ── Demo data (used until Supabase tables are wired) ── */
const INITIAL_RESUMES = [
  {
    id: '1',
    title: 'Frontend Developer Role',
    jobTitle: 'Senior React Developer',
    atsScore: 92,
    updatedAt: '2 hours ago',
    color: '#4f6ef7',
  },
  {
    id: '2',
    title: 'Fullstack Engineering',
    jobTitle: 'Full Stack Developer',
    atsScore: 78,
    updatedAt: '2 days ago',
    color: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Tech Lead Application',
    jobTitle: 'Technical Lead',
    atsScore: 45,
    updatedAt: '1 week ago',
    color: '#06b6d4',
  },
];

/* ════════════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();

  /* ── Auth state ── */
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [plan, setPlan] = useState(user?.plan || 'Free'); // future: fetch from profile

  /* ── Data ── */
  const [resumes, setResumes] = useState(INITIAL_RESUMES);
  const [activeTab, setActiveTab] = useState('resumes');

  /* ── UI state ── */
  const [deleteModal, setDeleteModal] = useState({ open: false, resume: null });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const editRef = useRef(null);

  /* ── Focus input when editing ── */
  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  /* ── Derived values ── */
  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  const totalResumes = resumes.length;
  const bestAts = resumes.length
    ? Math.max(...resumes.map((r) => r.atsScore))
    : 0;
  const coverLetters = 0; // placeholder

  const isFree = plan === 'Free';
  const resumesUsed = totalResumes;
  const resumesLimit = 1;

  /* ── Handlers ── */
  const openDeleteModal = (resume) =>
    setDeleteModal({ open: true, resume });

  const closeDeleteModal = () =>
    setDeleteModal({ open: false, resume: null });

  const confirmDelete = () => {
    setResumes((prev) =>
      prev.filter((r) => r.id !== deleteModal.resume.id)
    );
    toast.success('Resume deleted');
    closeDeleteModal();
  };

  const startEditing = (resume) => {
    setEditingId(resume.id);
    setEditTitle(resume.title);
  };

  const saveTitle = (id) => {
    if (editTitle.trim()) {
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, title: editTitle.trim() } : r))
      );
    }
    setEditingId(null);
  };

  const handleDownload = (resume) => {
    toast('PDF download coming soon!', { icon: '📄' });
  };

  /* ── ATS tier helpers ── */
  const atsTier = (score) => {
    if (score >= 75) return 'excellent';
    if (score >= 50) return 'good';
    return 'needs-work';
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="dash">
      <Navbar />

      {/* ── FREE‑USER UPGRADE BANNER ── */}
      {isFree && (
        <div className="dash-banner" id="upgrade-banner">
          <div className="dash-banner__inner">
            <div className="dash-banner__msg">
              <Zap size={16} />
              <span>
                You've used <strong>{resumesUsed}/{resumesLimit}</strong> free
                resume. Upgrade to Pro for unlimited!
              </span>
            </div>
            <Link to="/pricing" className="dash-banner__btn" id="upgrade-now-btn">
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      <div className="dash__container">
        {/* ── TOP BAR ── */}
        <header className="dash-topbar" id="dash-topbar">
          <div className="dash-topbar__left">
            <h1 className="dash-topbar__greeting">
              Welcome back, <span className="dash-topbar__name">{userName}</span>
            </h1>
            <span
              className={`dash-topbar__plan ${
                plan === 'Pro' ? 'dash-topbar__plan--pro' : ''
              }`}
            >
              {plan === 'Pro' && <Crown size={12} />}
              {plan} Plan
            </span>
          </div>

          <Link to="/builder" className="dash-topbar__new-btn" id="new-resume-btn">
            <Plus size={18} />
            New Resume
          </Link>
        </header>

        {/* ── STATS ROW ── */}
        <section className="dash-stats" id="stats-row">
          <StatCard
            icon={<FileText size={22} />}
            label="Total Resumes"
            value={totalResumes}
            color="blue"
          />
          <StatCard
            icon={<Target size={22} />}
            label="Best ATS Score"
            value={bestAts}
            suffix="/ 100"
            color="green"
          />
          <StatCard
            icon={<Mail size={22} />}
            label="Cover Letters"
            value={coverLetters}
            color="purple"
          />
        </section>

        {/* ── TABS ── */}
        <div className="dash-tabs" id="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'resumes' ? 'dash-tab--active' : ''}`}
            onClick={() => setActiveTab('resumes')}
            id="tab-resumes"
          >
            <FileText size={15} />
            Resumes
            <span className="dash-tab__count">{totalResumes}</span>
          </button>
          <button
            className={`dash-tab ${activeTab === 'coverLetters' ? 'dash-tab--active' : ''}`}
            onClick={() => setActiveTab('coverLetters')}
            id="tab-cover-letters"
          >
            <Mail size={15} />
            Cover Letters
          </button>
        </div>

        {/* ── CONTENT ── */}
        <main className="dash-content">
          {activeTab === 'resumes' && (
            <>
              {resumes.length === 0 ? (
                /* ── EMPTY STATE ── */
                <div className="dash-empty" id="empty-state">
                  <div className="dash-empty__icon">
                    <FilePlus size={44} />
                  </div>
                  <h3 className="dash-empty__title">
                    No resumes yet. Create your first one!
                  </h3>
                  <p className="dash-empty__desc">
                    Build an ATS-friendly resume and start landing more
                    interviews today.
                  </p>
                  <Link
                    to="/builder"
                    className="dash-empty__btn"
                    id="empty-create-btn"
                  >
                    <Plus size={18} />
                    Create Resume
                  </Link>
                </div>
              ) : (
                /* ── RESUME GRID ── */
                <div className="dash-grid" id="resume-grid">
                  {resumes.map((resume) => (
                    <div className="rcard" key={resume.id}>
                      {/* Thumbnail */}
                      <div
                        className="rcard__thumb"
                        style={{ '--accent': resume.color }}
                        onClick={() => navigate(`/builder?id=${resume.id}`)}
                      >
                        {/* Mini resume skeleton */}
                        <div className="rcard__preview">
                          <div className="rcard__preview-header" />
                          <div className="rcard__preview-line rcard__preview-line--short" />
                          <div className="rcard__preview-line" />
                          <div className="rcard__preview-line" />
                          <div className="rcard__preview-line rcard__preview-line--med" />
                          <div className="rcard__preview-gap" />
                          <div className="rcard__preview-line" />
                          <div className="rcard__preview-line rcard__preview-line--short" />
                        </div>

                        {/* ATS badge */}
                        <span
                          className={`rcard__ats rcard__ats--${atsTier(resume.atsScore)}`}
                        >
                          <BarChart3 size={12} />
                          {resume.atsScore}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="rcard__body">
                        {/* Editable title */}
                        <div className="rcard__title-row">
                          {editingId === resume.id ? (
                            <div className="rcard__edit-wrap">
                              <input
                                ref={editRef}
                                className="rcard__edit-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={() => saveTitle(resume.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveTitle(resume.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button
                                className="rcard__edit-save"
                                onClick={() => saveTitle(resume.id)}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                className="rcard__edit-cancel"
                                onClick={() => setEditingId(null)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3
                                className="rcard__title"
                                onClick={() => startEditing(resume)}
                                title="Click to rename"
                              >
                                {resume.title}
                              </h3>
                              <button
                                className="rcard__rename-btn"
                                onClick={() => startEditing(resume)}
                                aria-label="Rename"
                              >
                                <Pencil size={13} />
                              </button>
                            </>
                          )}
                        </div>

                        <p className="rcard__job">
                          <Target size={13} />
                          {resume.jobTitle}
                        </p>
                        <p className="rcard__date">
                          Last updated: {resume.updatedAt}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="rcard__actions">
                        <button
                          className="rcard__action rcard__action--edit"
                          onClick={() => navigate(`/builder?id=${resume.id}`)}
                          title="Edit"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button
                          className="rcard__action rcard__action--download"
                          onClick={() => handleDownload(resume)}
                          title="Download PDF"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          className="rcard__action rcard__action--delete"
                          onClick={() => openDeleteModal(resume)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'coverLetters' && (
            <div className="dash-empty" id="cover-letters-empty">
              <div className="dash-empty__icon dash-empty__icon--purple">
                <Mail size={44} />
              </div>
              <h3 className="dash-empty__title">
                Cover Letters Coming Soon
              </h3>
              <p className="dash-empty__desc">
                We're building an AI-powered cover letter generator to pair
                perfectly with your resumes.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal.open && deleteModal.resume && (
        <div className="dash-modal-overlay" id="delete-modal">
          <div className="dash-modal">
            <div className="dash-modal__icon">
              <AlertTriangle size={24} />
            </div>
            <h3 className="dash-modal__title">Delete Resume</h3>
            <p className="dash-modal__desc">
              Are you sure you want to delete "
              <strong>{deleteModal.resume.title}</strong>"? This action
              cannot be undone.
            </p>
            <div className="dash-modal__actions">
              <button
                className="dash-modal__btn dash-modal__btn--cancel"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="dash-modal__btn dash-modal__btn--delete"
                onClick={confirmDelete}
                id="confirm-delete-btn"
              >
                <Trash2 size={14} />
                Delete Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card Sub‑component ── */
function StatCard({ icon, label, value, suffix, color = 'blue' }) {
  return (
    <div className={`dash-stat dash-stat--${color}`}>
      <div className="dash-stat__icon">{icon}</div>
      <div className="dash-stat__info">
        <span className="dash-stat__label">{label}</span>
        <div className="dash-stat__value-row">
          <span className="dash-stat__value">{value}</span>
          {suffix && <span className="dash-stat__suffix">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
