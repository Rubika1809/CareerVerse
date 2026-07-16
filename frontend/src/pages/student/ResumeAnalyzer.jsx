import { useState, useRef, useCallback } from 'react';
import { MdUploadFile, MdAnalytics, MdCheckCircle, MdWarning, MdLightbulb, MdDelete, MdDownload } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { resumeService } from '../../services/mockService';
import './ResumeAnalyzer.css';

const ScoreGauge = ({ score }) => {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work';
  return (
    <div className="score-gauge">
      <svg viewBox="0 0 120 70" className="gauge-svg">
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 157} 157`} style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="60" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
        <text x="60" y="70" textAnchor="middle" fontSize="7" fill="#94A3B8">{label}</text>
      </svg>
    </div>
  );
};

// Helper to load CDN scripts dynamically
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.body.appendChild(script);
  });
};

const extractTextFromFile = async (file) => {
  const fileType = file.type || '';
  const fileName = file.name || '';
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    // Load PDF.js from Cloudflare CDN
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  }
  
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    // Load Mammoth.js from Cloudflare CDN
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
};

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return; }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) { toast.warning('Please upload a resume first'); return; }
    setAnalyzing(true);
    try {
      // Dynamically extract text in the browser from PDF, DOCX or TXT
      const extractedText = await extractTextFromFile(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Could not extract text from file. Please ensure it has readable text.');
      }
      
      const res = await resumeService.analyze(user?.id, extractedText);
      setResult(res);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreColor = result ? (result.score >= 75 ? 'success' : result.score >= 50 ? 'warning' : 'danger') : '';
  const atsColor = result ? (result.atsScore >= 75 ? 'success' : result.atsScore >= 50 ? 'warning' : 'danger') : '';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume to get AI-powered analysis, skill gap identification, and improvement suggestions.</p>
      </div>

      <div className="resume-layout">
        {/* Upload Panel */}
        <div className="resume-upload-panel">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upload Resume</h3>
            </div>

            {/* Drop Zone */}
            <div
              className={`drop-zone ${dragging ? 'drop-zone--active' : ''} ${file ? 'drop-zone--has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              id="resume-drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={e => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="resume-file-input"
              />
              {file ? (
                <div className="file-preview">
                  <div className="file-icon">📄</div>
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}>
                    <MdDelete size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <div className="drop-icon"><MdUploadFile size={32} /></div>
                  <p className="font-semibold">Drag & drop your resume</p>
                  <p className="text-sm text-muted">or click to browse</p>
                  <div className="drop-formats">
                    <span className="badge badge-neutral">PDF</span>
                    <span className="badge badge-neutral">DOCX</span>
                    <span className="badge badge-neutral">TXT</span>
                  </div>
                  <p className="text-xs text-muted">Max 5MB</p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-full btn-lg"
              onClick={analyze}
              disabled={!file || analyzing}
              id="analyze-resume-submit"
              style={{ marginTop: '1rem' }}
            >
              {analyzing ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing with AI...</>
              ) : (
                <><MdAnalytics size={18} /> Analyze Resume</>
              )}
            </button>

            {analyzing && (
              <div className="analyzing-steps">
                {['Extracting document text...', 'Running heuristic parsing...', 'Matching skills repository...', 'Generating ATS profile...'].map((s, i) => (
                  <div key={s} className="analyzing-step" style={{ animationDelay: `${i * 0.4}s` }}>
                    <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                    <span className="text-xs text-muted">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Resume Tips</h3>
              <MdLightbulb size={18} color="var(--warning)" />
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Use standard section headers (Education, Skills, Experience)',
                'Quantify achievements (e.g., "Improved performance by 40%")',
                'Include relevant technical skills and certifications',
                'Keep resume to 1-2 pages for freshers',
                'Use action verbs: Developed, Built, Optimized, Led',
              ].map((tip, i) => (
                <li key={i} className="resume-tip">
                  <span className="tip-num">{i + 1}</span>
                  <span className="text-sm text-secondary">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="resume-results-panel">
          {!result && !analyzing && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No Analysis Yet</h3>
                <p>Upload your resume and click "Analyze Resume" to get detailed insights.</p>
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Candidate Info Profile Card */}
              <div className="card animate-fadeIn">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h3 className="card-title" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                    Extracted Candidate Profile
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Candidate Name</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Email Address</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Phone Number</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Education Details</p>
                    <p className="text-xs text-secondary" style={{ whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>{result.education}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Technical Projects</p>
                    <p className="text-xs text-secondary" style={{ whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>{result.projects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold tracking-wider">Work Experience</p>
                    <p className="text-xs text-secondary" style={{ whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>{result.experience}</p>
                  </div>
                </div>
              </div>

              {/* Score & ATS Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card score-card" style={{ height: '100%' }}>
                  <div className="score-header">
                    <div>
                      <h3 className="card-title">Resume Score</h3>
                      <p className="text-xs text-muted">Quality completeness</p>
                    </div>
                    <span className={`badge badge-${scoreColor} text-lg`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                      {result.score}/100
                    </span>
                  </div>
                  <ScoreGauge score={result.score} />
                </div>

                <div className="card score-card" style={{ height: '100%' }}>
                  <div className="score-header">
                    <div>
                      <h3 className="card-title">Overall ATS Match</h3>
                      <p className="text-xs text-muted">Keyword & structure match</p>
                    </div>
                    <span className={`badge badge-${atsColor} text-lg`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                      {result.atsScore}/100
                    </span>
                  </div>
                  <ScoreGauge score={result.atsScore} />
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <MdCheckCircle size={18} color="var(--success)" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
                    Extracted Skills ({result.foundSkills.length})
                  </h3>
                </div>
                {result.foundSkills.length > 0 ? (
                  <div className="skill-tags">
                    {result.foundSkills.map(s => (
                      <span key={s} className="skill-tag skill-tag--found">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Not Found</p>
                )}
              </div>

              {/* Missing Skills & Keywords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title" style={{ fontSize: '0.9rem' }}>
                      <MdWarning size={16} color="var(--warning)" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Missing Skills ({result.missingSkills.length})
                    </h3>
                  </div>
                  <div className="skill-tags">
                    {result.missingSkills.map(s => (
                      <span key={s} className="skill-tag skill-tag--missing" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title" style={{ fontSize: '0.9rem' }}>
                      <MdWarning size={16} color="var(--danger)" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Missing ATS Keywords ({result.missingKeywords.length})
                    </h3>
                  </div>
                  <div className="skill-tags">
                    {result.missingKeywords.map(k => (
                      <span key={k} className="skill-tag skill-tag--missing" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: 'var(--danger-light)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <h3 className="font-semibold text-sm" style={{ color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MdCheckCircle size={18} /> Strengths
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#166534' }}>
                    {result.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="card" style={{ background: '#FFF7ED', borderColor: '#FFEDD5' }}>
                  <h3 className="font-semibold text-sm" style={{ color: '#9A3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MdWarning size={18} /> Weaknesses
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#9A3412' }}>
                    {result.weaknesses.map((weak, idx) => (
                      <li key={idx}>{weak}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Personalized Recommendations & Improvement Suggestions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <MdLightbulb size={18} color="var(--primary)" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
                    Personalized Recommendations
                  </h3>
                </div>
                
                {result.recommendations.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Skills You Should Learn (Tailored Suggestions):</p>
                    <div className="skill-tags">
                      {result.recommendations.map(r => (
                        <span key={r} className="skill-tag" style={{ background: 'var(--primary-50)', color: 'var(--primary-dark)', borderColor: 'var(--primary-200)', border: '1px solid' }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Resume Formatting & Content Suggestions:</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="suggestion-item" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                        <div className="suggestion-num" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>{i + 1}</div>
                        <p className="text-xs text-secondary">{s}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
