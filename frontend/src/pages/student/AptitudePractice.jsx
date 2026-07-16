import { useState, useEffect } from 'react';
import { MdTimer, MdCheckCircle, MdCancel, MdArrowForward, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { aptitudeQuestions } from '../../data/appData';
import { aptitudeService } from '../../services/mockService';
import './AptitudePractice.css';

const TIME_LIMIT = 30 * 60; // 30 minutes

export default function AptitudePractice() {
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const categories = Object.keys(aptitudeQuestions);

  useEffect(() => {
    if (!isStarted || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTest = (cat) => {
    setCategory(cat);
    // Shuffle and pick 10 questions
    const qList = [...aptitudeQuestions[cat]].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(qList);
    setAnswers({});
    setTimeLeft(TIME_LIMIT);
    setIsStarted(true);
    setResult(null);
  };

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const submitTest = async () => {
    if(window.confirm('Are you sure you want to submit the test?')) {
      setSaving(true);
      let score = 0;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      questions.forEach(q => {
        if (answers[q.id] === undefined) {
          unattempted++;
        } else if (answers[q.id] === q.answer) {
          score += 1;
          correct++;
        } else {
          incorrect++;
        }
      });

      const resData = {
        category,
        score,
        total: questions.length,
        correct,
        incorrect,
        unattempted,
        timeTaken: TIME_LIMIT - timeLeft,
      };

      try {
        const saved = await aptitudeService.saveResult(user.id, resData);
        setResult({ ...saved, details: questions.map(q => ({ ...q, selected: answers[q.id] })) });
        setIsStarted(false);
        toast.success('Test submitted successfully!');
      } catch (err) {
        toast.error('Failed to save test result');
      } finally {
        setSaving(false);
      }
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
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{category} Test Results</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
            <div>
              <p className="text-muted">Score</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{result.score}/{result.total}</p>
            </div>
            <div>
              <p className="text-muted">Accuracy</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
                {Math.round((result.correct / (result.total - result.unattempted || 1)) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-muted">Time Taken</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatTime(result.timeTaken)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>✅ {result.correct} Correct</span>
            <span className="badge badge-danger" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>❌ {result.incorrect} Incorrect</span>
            <span className="badge badge-neutral" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>➖ {result.unattempted} Unattempted</span>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setResult(null)}>
            <MdRefresh size={18} /> Take Another Test
          </button>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>Detailed Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result.details.map((q, i) => {
            const isCorrect = q.selected === q.answer;
            const isUnattempted = q.selected === undefined;
            return (
              <div key={q.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${isCorrect ? 'var(--success)' : isUnattempted ? 'var(--text-muted)' : 'var(--danger)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <p className="font-semibold">Q{i + 1}. {q.question}</p>
                  {isCorrect ? <MdCheckCircle color="var(--success)" size={24} /> : isUnattempted ? <span className="badge badge-neutral">Skipped</span> : <MdCancel color="var(--danger)" size={24} />}
                </div>
                <div className="options-grid" style={{ marginBottom: '1rem' }}>
                  {q.options.map((opt, oIdx) => {
                    let className = 'apt-option apt-option--result';
                    if (oIdx === q.answer) className += ' apt-option--correct';
                    else if (oIdx === q.selected) className += ' apt-option--wrong';
                    return (
                      <div key={oIdx} className={className}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Explanation:</p>
                  <p className="text-sm text-secondary">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isStarted) {
    return (
      <div className="page-container">
        <div className="card apt-header" style={{ position: 'sticky', top: 'var(--navbar-height)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-lg font-bold">{category} Test</h2>
            <p className="text-sm text-muted">Answer all {questions.length} questions</p>
          </div>
          <div className={`timer-badge ${timeLeft < 300 ? 'timer-danger' : ''}`}>
            <MdTimer size={20} />
            <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {questions.map((q, i) => (
            <div key={q.id} className="card" style={{ padding: '1.5rem' }}>
              <p className="font-semibold" style={{ marginBottom: '1rem', fontSize: '1.0625rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{i + 1}.</span>
                {q.question}
              </p>
              <div className="options-grid">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`apt-option ${answers[q.id] === oIdx ? 'apt-option--selected' : ''}`}
                    onClick={() => handleOptionSelect(q.id, oIdx)}
                  >
                    <span className="apt-option-letter">{String.fromCharCode(65 + oIdx)}</span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-primary btn-lg" onClick={submitTest} disabled={saving} style={{ width: '200px' }}>
            {saving ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Submit Test'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Aptitude Practice</h1>
        <p>Improve your problem-solving speed with timed mock tests.</p>
      </div>

      <div className="aptitude-categories">
        {categories.map((cat, i) => {
          const colors = ['#2563EB', '#10B981', '#F59E0B', '#7C3AED'];
          const bgs = ['#EFF6FF', '#ECFDF5', '#FFFBEB', '#F5F3FF'];
          return (
            <div key={cat} className="card category-card">
              <div className="category-icon" style={{ background: bgs[i], color: colors[i] }}>
                <MdTimer size={32} />
              </div>
              <h3 className="category-title">{cat}</h3>
              <p className="category-desc">10 Questions • 30 Minutes</p>
              <button className="btn btn-primary w-full" onClick={() => startTest(cat)}>
                Start Test <MdArrowForward size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
