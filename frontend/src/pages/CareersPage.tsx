import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  FileText,
  Globe,
  Phone,
  Mail,
  Sparkles,
  Users,
  TrendingUp,
  ShieldCheck,
  Laptop,
  GraduationCap,
  Building,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { KindlyRateLogo, KindlyRateBrand, StarIcon, CheckCircleIcon } from '../components/Logos.js';
import { api } from '../services/api.js';
import { ALL_OPEN_JOBS, JobOpening } from '../data/jobsData.js';

type Job = JobOpening;
const FALLBACK_JOBS: Job[] = ALL_OPEN_JOBS;

const DEPARTMENTS = [
  'All Departments',
  'Sales & BD',
  'Engineering',
  'Product & Design',
  'Marketing & Growth',
  'Customer Success',
  'Operations',
  'HR & Legal',
];

const LOCATIONS = [
  'All Locations',
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Remote',
];

interface Props {
  onNavigateHome: () => void;
  onStartOnboarding: () => void;
  onNavigateLogin: () => void;
}

export const CareersPage: React.FC<Props> = ({
  onNavigateHome,
  onStartOnboarding,
  onNavigateLogin,
}) => {
  const [jobs, setJobs] = useState<Job[]>(FALLBACK_JOBS);
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '1–3 Years',
    currentCompany: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    coverNote: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getOpenJobs()
      .then((res: any) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setJobs(res);
        }
      })
      .catch(() => {
        // Fallback to FALLBACK_JOBS
      });
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept =
        selectedDept === 'All Departments' ||
        job.department.toLowerCase() === selectedDept.toLowerCase() ||
        (selectedDept === 'Sales & BD' && job.department.includes('Sales')) ||
        (selectedDept === 'Marketing & Growth' && job.department.includes('Marketing')) ||
        (selectedDept === 'HR & Legal' && (job.department.includes('HR') || job.department.includes('Legal')));

      const matchesLocation =
        selectedLocation === 'All Locations' ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.summary.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q));

      return matchesDept && matchesLocation && matchesSearch;
    });
  }, [jobs, selectedDept, selectedLocation, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedDept, selectedLocation, searchQuery]);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleCount);
  }, [filteredJobs, visibleCount]);

  const handleOpenJob = (job: Job) => {
    setSelectedJob(job);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleOpenApply = (job?: Job) => {
    if (job) setSelectedJob(job);
    setShowApplyModal(true);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.fullName.trim()) {
      setSubmitError('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitJobApplication({
        jobId: selectedJob?.id || 'open-application',
        jobTitle: selectedJob?.title || 'General Open Application',
        department: selectedJob?.department || 'General',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience,
        currentCompany: formData.currentCompany,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        resumeUrl: formData.resumeUrl,
        coverNote: formData.coverNote,
      });

      setSubmitSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        experience: '1–3 Years',
        currentCompany: '',
        linkedinUrl: '',
        portfolioUrl: '',
        resumeUrl: '',
        coverNote: '',
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit application. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-canvas, #fafafa)', minHeight: '100vh', color: 'var(--text, #09090b)', fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Top Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-light, #e4e4e7)',
          padding: '14px 24px',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div onClick={onNavigateHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <KindlyRateLogo height={32} />
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={onNavigateHome}
                style={{ background: 'none', border: 'none', color: '#52525b', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 10px' }}
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                style={{ background: 'none', border: 'none', color: '#52525b', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 10px' }}
              >
                Features
              </button>
              <button
                onClick={() => {
                  onNavigateHome();
                  setTimeout(() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                style={{ background: 'none', border: 'none', color: '#52525b', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 10px' }}
              >
                Pricing
              </button>
              <span
                style={{
                  background: 'rgba(22, 163, 74, 0.08)',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                Careers • We're Hiring
              </span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onNavigateLogin}
              style={{
                background: 'none',
                border: '1px solid #d4d4d8',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#18181b',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={onStartOnboarding}
              style={{
                background: '#09090b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '72px 24px 48px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(24, 24, 27, 0.05)',
            border: '1px solid rgba(24, 24, 27, 0.1)',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#18181b',
            marginBottom: '20px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          100+ Active Roles Across India • Engineering, Sales, AI, Design &amp; Operations
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#09090b',
            maxWidth: '860px',
            margin: '0 auto 20px',
          }}
        >
          Build the infrastructure that powers physical-to-digital local commerce
        </h1>

        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#52525b',
            maxWidth: '680px',
            margin: '0 auto 36px',
          }}
        >
          KindlyRate empowers over 876+ restaurants, clinics, salons, and retail chains to dominate Google Maps Local search through smart NFC QR hardware and AI reputation tech. Join us in Bengaluru or remotely across India.
        </p>

        {/* Culture / Key Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            textAlign: 'left',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '14px',
              padding: '22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <TrendingUp size={20} color="#15803d" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>High Impact &amp; Autonomy</h3>
            <p style={{ fontSize: '13.5px', color: '#71717a', lineHeight: 1.5, margin: 0 }}>
              What you ship on Thursday is placed on hundreds of store billing counters by Monday morning. Zero bureaucracy.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '14px',
              padding: '22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Laptop size={20} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>Top-Tier Compensation &amp; Gear</h3>
            <p style={{ fontSize: '13.5px', color: '#71717a', lineHeight: 1.5, margin: 0 }}>
              Competitive base salaries, transparent performance bonuses, ESOPs for core roles, M-series MacBooks, and ergonomic setup stipends.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '14px',
              padding: '22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Building size={20} color="#c2410c" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>Hybrid &amp; Remote Flexibility</h3>
            <p style={{ fontSize: '13.5px', color: '#71717a', lineHeight: 1.5, margin: 0 }}>
              Vibrant engineering hub in Bengaluru with flexible work-from-home options and fully remote support for experienced roles across India.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '14px',
              padding: '22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <GraduationCap size={20} color="#7e22ce" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>Continuous Learning</h3>
            <p style={{ fontSize: '13.5px', color: '#71717a', lineHeight: 1.5, margin: 0 }}>
              Annual learning allowances for books, courses, tech conferences, and cloud certification exams.
            </p>
          </div>
        </div>
      </section>

      {/* Main Job Board Section */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 24px 80px' }}>
        {/* Search & Filters */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <Search size={18} color="#a1a1aa" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by job title, skill (Node.js, React, Sales), or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  borderRadius: '10px',
                  border: '1px solid #d4d4d8',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fafafa',
                  color: '#18181b',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Location Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#71717a" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d4d4d8',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#18181b',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All Locations' ? '📍 All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DEPARTMENTS.map((dept) => {
                const isActive = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    style={{
                      background: isActive ? '#18181b' : '#f4f4f5',
                      color: isActive ? '#ffffff' : '#52525b',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {dept} {dept !== 'All Departments' ? `(${jobs.filter(j => j.department.toLowerCase().includes(dept.toLowerCase().slice(0, 4))).length})` : `(${jobs.length})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#18181b' }}>
            Available Positions ({filteredJobs.length})
          </h2>
          <span style={{ fontSize: '13.5px', color: '#71717a' }}>
            Showing {displayedJobs.length} of {filteredJobs.length} filtered openings ({jobs.length} total openings across India)
          </span>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px dashed #d4d4d8',
              borderRadius: '16px',
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <Briefcase size={36} color="#a1a1aa" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#18181b', margin: '0 0 6px' }}>No openings match your criteria</h3>
            <p style={{ fontSize: '14px', color: '#71717a', margin: '0 0 20px' }}>Try broadening your search or department filter.</p>
            <button
              onClick={() => {
                setSelectedDept('All Departments');
                setSearchQuery('');
              }}
              style={{
                background: '#18181b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {displayedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleOpenJob(job)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '14px',
                  padding: '24px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a1a1aa';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e4e4e7';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ flex: '1 1 540px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#f4f4f5',
                        color: '#27272a',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {job.department}
                    </span>
                    <span
                      style={{
                        background: job.type.includes('Internship') ? 'rgba(59, 130, 246, 0.08)' : 'rgba(22, 163, 74, 0.08)',
                        color: job.type.includes('Internship') ? '#1d4ed8' : '#15803d',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '6px',
                      }}
                    >
                      {job.type}
                    </span>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>•</span>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>{job.experience}</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#09090b', letterSpacing: '-0.01em' }}>
                    {job.title}
                  </h3>

                  <p style={{ fontSize: '14px', color: '#52525b', lineHeight: 1.5, margin: '0 0 14px', maxWidth: '720px' }}>
                    {job.summary}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#71717a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} color="#71717a" />
                      {job.location}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#18181b' }}>
                      ₹ {job.salaryRange}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenApply(job);
                    }}
                    style={{
                      background: '#18181b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Apply Now
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredJobs.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              onClick={() => setVisibleCount((prev) => prev + 16)}
              style={{
                background: '#ffffff',
                border: '1.5px solid #18181b',
                color: '#18181b',
                borderRadius: '10px',
                padding: '12px 32px',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#18181b';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#18181b';
              }}
            >
              <span>Load More Open Positions ({filteredJobs.length - visibleCount} more)</span>
              <ChevronRight size={16} />
            </button>
            <div style={{ fontSize: '12.5px', color: '#71717a', marginTop: '8px' }}>
              Showing {visibleCount} of {filteredJobs.length} matching jobs
            </div>
          </div>
        )}

        {/* General Application Banner */}
        <div
          style={{
            marginTop: '48px',
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            borderRadius: '16px',
            padding: '36px 40px',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              Open Application
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>
              Don't see the exact role you're looking for?
            </h3>
            <p style={{ fontSize: '14.5px', color: '#d4d4d8', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              We are constantly expanding our engineering, sales, and operations teams. Submit your profile, resume, and what you’d like to build with us.
            </p>
          </div>

          <button
            onClick={() => handleOpenApply({
              id: 'open-general',
              title: 'General Open Application',
              department: 'General',
              location: 'Bengaluru / Remote',
              type: 'Full-time / Flexible',
              experience: 'Any',
              salaryRange: 'Competitive',
              tags: ['Open Application'],
              summary: 'Open application for future roles',
              responsibilities: [],
              requirements: [],
            })}
            style={{
              background: '#ffffff',
              color: '#18181b',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            Submit Open Profile
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* JOB DETAILS MODAL */}
      {selectedJob && !showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '36px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedJob(null)}
              style={{
                position: 'absolute',
                right: '24px',
                top: '24px',
                background: '#f4f4f5',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#71717a" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ background: '#f4f4f5', color: '#18181b', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                {selectedJob.department}
              </span>
              <span style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#15803d', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                {selectedJob.type}
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', margin: '0 0 12px' }}>
              {selectedJob.title}
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '14px 18px', background: '#fafafa', borderRadius: '10px', marginBottom: '24px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: '#71717a', display: 'block', fontSize: '12px' }}>Location</span>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{selectedJob.location}</span>
              </div>
              <div style={{ borderLeft: '1px solid #e4e4e7', paddingLeft: '16px' }}>
                <span style={{ color: '#71717a', display: 'block', fontSize: '12px' }}>Experience</span>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{selectedJob.experience}</span>
              </div>
              <div style={{ borderLeft: '1px solid #e4e4e7', paddingLeft: '16px' }}>
                <span style={{ color: '#71717a', display: 'block', fontSize: '12px' }}>Compensation</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>{selectedJob.salaryRange}</span>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#09090b' }}>About the Role</h4>
              <p style={{ fontSize: '14px', color: '#52525b', lineHeight: 1.6, margin: 0 }}>
                {selectedJob.summary}
              </p>
            </div>

            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 10px', color: '#09090b' }}>What You Will Do</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '14px', lineHeight: 1.6 }}>
                  {selectedJob.responsibilities.map((resp, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div style={{ marginBottom: '26px' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 10px', color: '#09090b' }}>What We Look For</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '14px', lineHeight: 1.6 }}>
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f4f4f5' }}>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'none',
                  border: '1px solid #d4d4d8',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#52525b',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => setShowApplyModal(true)}
                style={{
                  background: '#18181b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 22px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Apply for this Position
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB APPLICATION MODAL */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => {
            if (!submitting) {
              setShowApplyModal(false);
            }
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '36px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowApplyModal(false)}
              disabled={submitting}
              style={{
                position: 'absolute',
                right: '24px',
                top: '24px',
                background: '#f4f4f5',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <X size={16} color="#71717a" />
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                  }}
                >
                  <CheckCircle2 size={32} color="#15803d" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', margin: '0 0 10px' }}>
                  Application Submitted!
                </h3>
                <p style={{ fontSize: '14.5px', color: '#52525b', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 24px' }}>
                  Thank you for applying for <strong>{selectedJob?.title || 'KindlyRate'}</strong>. Our hiring team directly reviews applications in the Super Admin portal and will respond within 48 hours.
                </p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedJob(null);
                    setSubmitSuccess(false);
                  }}
                  style={{
                    background: '#18181b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back to Careers
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Applying For
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', margin: '4px 0 2px' }}>
                    {selectedJob?.title || 'Open Application'}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#71717a' }}>
                    {selectedJob?.department} • {selectedJob?.location}
                  </span>
                </div>

                {submitError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#b91c1c',
                      fontSize: '13.5px',
                      marginBottom: '20px',
                    }}
                  >
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      Experience Level
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Fresher / Student">Fresher / Student (0 Yrs)</option>
                      <option value="1–2 Years">1–2 Years</option>
                      <option value="3–5 Years">3–5 Years</option>
                      <option value="5+ Years">5+ Years (Senior)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                    Current Company or College (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy / Infosys / RV College"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d4d4d8',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                      Resume / Portfolio Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="Google Drive, Dropbox, GitHub link"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '6px' }}>
                    Why KindlyRate? / Quick Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what excites you about this role, or share a quick highlight of what you've built..."
                    value={formData.coverNote}
                    onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d4d4d8',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    disabled={submitting}
                    style={{
                      background: 'none',
                      border: '1px solid #d4d4d8',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#52525b',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: '#18181b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                    {!submitting && <ArrowRight size={14} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e4e4e7', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px' }}>
          <div style={{ maxWidth: '320px' }}>
            <div onClick={onNavigateHome} style={{ cursor: 'pointer', marginBottom: '14px' }}>
              <KindlyRateLogo height={32} />
            </div>
            <p style={{ fontSize: '13.5px', color: '#71717a', lineHeight: 1.6, margin: 0 }}>
              The #1 Google Reviews, NFC QR Hardware, and Local SEO booster platform empowering Indian local businesses.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', fontSize: '13.5px' }}>
            <div>
              <h5 style={{ fontWeight: 700, margin: '0 0 12px', color: '#18181b' }}>Platform</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#71717a' }}>
                <span onClick={onNavigateHome} style={{ cursor: 'pointer' }}>Home</span>
                <span onClick={() => { onNavigateHome(); setTimeout(() => document.getElementById('features')?.scrollIntoView(), 100); }} style={{ cursor: 'pointer' }}>Features</span>
                <span onClick={() => { onNavigateHome(); setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 100); }} style={{ cursor: 'pointer' }}>Pricing</span>
                <span style={{ fontWeight: 600, color: '#18181b' }}>Careers</span>
              </div>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, margin: '0 0 12px', color: '#18181b' }}>Legal &amp; Trust</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#71717a' }}>
                <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms &amp; Conditions</a>
                <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/refund" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</a>
              </div>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, margin: '0 0 12px', color: '#18181b' }}>Contact Us</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#71717a' }}>
                <span>Bengaluru, Karnataka, India</span>
                <span>support@kindlyrate.com</span>
                <span>+91 81238 24899</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid #f4f4f5', textAlign: 'center', fontSize: '12.5px', color: '#a1a1aa' }}>
          © {new Date().getFullYear()} KindlyRate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
