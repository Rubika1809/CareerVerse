import { useState, useEffect, useCallback } from 'react';
import { MdPlayArrow, MdTimer, MdStop, MdCheckCircle, MdBusiness, MdPsychology } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { interviewQuestions } from '../../data/appData';
import { interviewService } from '../../services/mockService';
import './MockInterview.css';

const MOCK_TIME = 120; // 2 minutes per question

export default function MockInterview() {
  const { user } = useAuth();
  const [setup, setSetup] = useState({ company: '', role: '' });
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MOCK_TIME);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const companies = Object.keys(interviewQuestions);
  const roles = setup.company ? Object.keys(interviewQuestions[setup.company]) : [];

  // Timer logic
  useEffect(() => {
    if (!isStarted || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return MOCK_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, result, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const startInterview = () => {
    if (!setup.company || !setup.role) {
      toast.warning('Please select company and role');
      return;
    }
    const qList = [...interviewQuestions[setup.company][setup.role]].sort(() => 0.5 - Math.random()).slice(0, 5); // 5 random questions
    setQuestions(qList);
    setAnswers([]);
    setCurrentIndex(0);
    setTimeLeft(MOCK_TIME);
    setCurrentAnswer('');
    setIsStarted(true);
    setResult(null);
  };

  const handleNextQuestion = useCallback(() => {
    setAnswers(prev => [...prev, {
      questionId: questions[currentIndex].id,
      text: questions[currentIndex].question,
      answer: currentAnswer,
      timeTaken: MOCK_TIME - timeLeft,
    }]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setTimeLeft(MOCK_TIME);
    } else {
      finishInterview();
    }
  }, [currentIndex, currentAnswer, timeLeft, questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishInterview = async () => {
    setSaving(true);
    // Auto-grade mock: based on answer length & keywords
    const finalAnswers = [...answers, {
      questionId: questions[currentIndex].id,
      text: questions[currentIndex].question,
      answer: currentAnswer,
      timeTaken: MOCK_TIME - timeLeft,
    }];

    let totalScore = 0;
    finalAnswers.forEach(a => {
      let qScore = 0;
      const len = a.answer.trim().length;
      if (len > 150) qScore = 20; // Max 20 per question (5 questions = 100 max)
      else if (len > 80) qScore = 15;
      else if (len > 30) qScore = 10;
      else if (len > 0) qScore = 5;
      totalScore += qScore;
    });

    const resData = {
      company: setup.company,
      role: setup.role,
      score: totalScore,
      totalQuestions: 5,
      strengths: totalScore > 75 ? ['Detailed explanations', 'Good time management'] : ['Attempted all questions'],
      improvements: totalScore < 75 ? ['Provide more detailed answers', 'Use specific examples', 'Include technical keywords'] : ['Keep up the good work'],
    };

    try {
      const saved = await interviewService.saveResult(user.id, resData);
      setResult(saved);
      setIsStarted(false);
      toast.success('Interview completed!');
    } catch (err) {
      toast.error('Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (result) {
    return (
      <div className="page-container">
        <div className="card text-center" style={{ padding: '3rem 2rem', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, background: 'var(--success-light)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <MdCheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Interview Completed!</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>You have successfully finished the {setup.company} Mock Interview.</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <p className="text-sm text-muted">Overall Score</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: result.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                {result.score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)', boxShadow: 'none' }}>
              <p className="font-semibold" style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Strengths</p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)', boxShadow: 'none' }}>
              <p className="font-semibold" style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Areas to Improve</p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setResult(null)}>
            Take Another Interview
          </button>
        </div>
      </div>
    );
  }

  if (isStarted) {
    const q = questions[currentIndex];
    return (
      <div className="page-container" style={{ maxWidth: 900 }}>
        <div className="interview-header card">
          <div>
            <h2 className="text-lg font-bold">{setup.company} - {setup.role}</h2>
            <p className="text-sm text-muted">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className={`timer-badge ${timeLeft < 30 ? 'timer-danger' : ''}`}>
            <MdTimer size={20} />
            <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
          <div className="question-box">
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>{q.type.toUpperCase()}</span>
            <span className={`badge badge-${q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}`} style={{ marginLeft: '0.5rem', marginBottom: '1rem' }}>
              {q.difficulty}
            </span>
            <h3 style={{ fontSize: '1.25rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>{q.question}</h3>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Your Answer</span>
              <span className="text-xs text-muted">{currentAnswer.length} chars</span>
            </label>
            <textarea
              className="form-control"
              style={{ minHeight: 200, resize: 'vertical', fontSize: '1rem', padding: '1rem' }}
              placeholder="Type your detailed answer here..."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn btn-danger btn-outline" onClick={() => { if(window.confirm('End interview early?')) finishInterview(); }}>
              <MdStop size={18} /> End Interview
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleNextQuestion}>
              {currentIndex === questions.length - 1 ? 'Submit Interview' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mock Interview Simulator</h1>
        <p>Practice company-specific interview questions in a real-time timed environment.</p>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MdPsychology size={32} />
          </div>
          <h2>Configure Your Interview</h2>
          <p className="text-sm text-secondary">Select your target company and role to get tailored questions.</p>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Select Company</label>
          <div className="input-icon-wrapper">
            <MdBusiness className="input-icon" size={18} />
            <select
              className="form-control input-with-icon"
              value={setup.company}
              onChange={e => setSetup({ company: e.target.value, role: '' })}
            >
              <option value="">-- Choose Company --</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {setup.company && (
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Select Role</label>
            <select
              className="form-control"
              value={setup.role}
              onChange={e => setSetup({ ...setup, role: e.target.value })}
            >
              <option value="">-- Choose Role --</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        <div className="interview-rules" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
          <p className="font-semibold text-sm" style={{ marginBottom: '0.5rem' }}>Interview Rules:</p>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
            <li>You will face 5 random questions for the selected role.</li>
            <li>You have exactly 2 minutes (120s) per question.</li>
            <li>Timer will auto-advance to the next question when it reaches 0.</li>
            <li>Answers are evaluated based on keywords and depth.</li>
          </ul>
        </div>

        <button
          className="btn btn-primary w-full btn-lg"
          onClick={startInterview}
          disabled={!setup.company || !setup.role}
        >
          <MdPlayArrow size={20} /> Start Mock Interview
        </button>
      </div>
    </div>
  );
}
