import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdCheckCircle, MdWarning } from 'react-icons/md';
import { toast } from 'react-toastify';
import { aptitudeQuestions as defaultQuestions } from '../../data/appData';

const DB_KEY = 'cv_db_questions';

// Load questions from localStorage or fallback to defaults
const loadQuestions = () => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Deep clone defaults so we don't mutate the import
  const clone = {};
  for (const cat of Object.keys(defaultQuestions)) {
    clone[cat] = defaultQuestions[cat].map(q => ({ ...q }));
  }
  localStorage.setItem(DB_KEY, JSON.stringify(clone));
  return clone;
};

const saveQuestions = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

const emptyForm = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answer: 0,
  explanation: '',
};

export default function ManageQuestions() {
  const [allQuestions, setAllQuestions] = useState(loadQuestions);
  const [category, setCategory] = useState('Quantitative');
  const categories = Object.keys(allQuestions);
  const questions = allQuestions[category] || [];

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Persist whenever allQuestions changes
  useEffect(() => {
    saveQuestions(allQuestions);
  }, [allQuestions]);

  // ── Helpers ──
  const update = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setFormErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.question.trim()) e.question = 'Question text is required';
    if (!form.optionA.trim()) e.optionA = 'Option A is required';
    if (!form.optionB.trim()) e.optionB = 'Option B is required';
    if (!form.optionC.trim()) e.optionC = 'Option C is required';
    if (!form.optionD.trim()) e.optionD = 'Option D is required';
    return e;
  };

  // ── Open Add Modal ──
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setShowModal(true);
  };

  // ── Open Edit Modal ──
  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({
      question: q.question,
      optionA: q.options[0] || '',
      optionB: q.options[1] || '',
      optionC: q.options[2] || '',
      optionD: q.options[3] || '',
      answer: q.answer,
      explanation: q.explanation || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // ── Save (Add or Edit) ──
  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const questionObj = {
      id: editingId || Date.now(),
      question: form.question.trim(),
      options: [form.optionA.trim(), form.optionB.trim(), form.optionC.trim(), form.optionD.trim()],
      answer: Number(form.answer),
      explanation: form.explanation.trim(),
    };

    setAllQuestions(prev => {
      const updated = { ...prev };
      const catList = [...(updated[category] || [])];

      if (editingId) {
        // Edit existing
        const idx = catList.findIndex(q => q.id === editingId);
        if (idx !== -1) catList[idx] = questionObj;
      } else {
        // Add new
        catList.push(questionObj);
      }

      updated[category] = catList;
      return updated;
    });

    toast.success(editingId ? 'Question updated successfully!' : 'New question added successfully!');
    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  // ── Delete ──
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAllQuestions(prev => {
      const updated = { ...prev };
      updated[category] = (updated[category] || []).filter(q => q.id !== deleteTarget.id);
      return updated;
    });
    toast.success('Question deleted successfully.');
    setDeleteTarget(null);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Questions</h1>
          <p>Add, edit or remove mock interview and aptitude questions.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-question-btn">
          <MdAdd size={20} /> Add New Question
        </button>
      </div>

      <div className="card">
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="text-sm text-muted">{questions.length} question{questions.length !== 1 ? 's' : ''} in {category}</span>
        </div>

        {/* Questions Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Question</th>
                <th>Correct Answer</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No questions in this category. Click "Add New Question" to create one.
                  </td>
                </tr>
              )}
              {questions.map((q, i) => (
                <tr key={q.id}>
                  <td className="font-semibold text-muted">{i + 1}</td>
                  <td>
                    <p className="font-medium text-sm">{q.question}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {q.options.map((opt, oIdx) => (
                        <span key={oIdx} className="text-xs text-secondary" style={{
                          fontWeight: oIdx === q.answer ? '700' : '400',
                          color: oIdx === q.answer ? 'var(--success)' : undefined
                        }}>
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--primary)' }}
                        title="Edit question"
                        onClick={() => openEdit(q)}
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        className="btn-icon text-danger"
                        title="Delete question"
                        onClick={() => setDeleteTarget(q)}
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(3px)', padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{
              width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
              animation: 'slideUp 0.25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingId ? <><MdEdit size={20} /> Edit Question</> : <><MdAdd size={20} /> Add New Question</>}
              </h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                <MdClose size={20} />
              </button>
            </div>

            {/* Category Badge */}
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge badge-primary">{category}</span>
            </div>

            {/* Question Text */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="q-text">Question *</label>
              <textarea
                id="q-text"
                className={`form-control ${formErrors.question ? 'error' : ''}`}
                rows={3}
                placeholder="Enter the question text..."
                value={form.question}
                onChange={e => update('question', e.target.value)}
                style={{ resize: 'vertical' }}
              />
              {formErrors.question && <span className="form-error">{formErrors.question}</span>}
            </div>

            {/* Options */}
            <p className="form-label" style={{ marginBottom: '0.5rem' }}>Answer Options *</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const fieldName = `option${letter}`;
                return (
                  <div className="form-group" key={letter} style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor={`q-opt-${letter}`} style={{ fontSize: '0.75rem' }}>
                      Option {letter} {Number(form.answer) === idx && <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Correct</span>}
                    </label>
                    <input
                      id={`q-opt-${letter}`}
                      type="text"
                      className={`form-control ${formErrors[fieldName] ? 'error' : ''}`}
                      placeholder={`Option ${letter}`}
                      value={form[fieldName]}
                      onChange={e => update(fieldName, e.target.value)}
                    />
                    {formErrors[fieldName] && <span className="form-error">{formErrors[fieldName]}</span>}
                  </div>
                );
              })}
            </div>

            {/* Correct Answer */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Correct Answer *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <button
                    key={letter}
                    type="button"
                    className={`btn ${Number(form.answer) === idx ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontWeight: 600 }}
                    onClick={() => update('answer', idx)}
                  >
                    {Number(form.answer) === idx && <MdCheckCircle size={16} style={{ marginRight: '0.25rem' }} />}
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="q-explanation">Explanation (Optional)</label>
              <textarea
                id="q-explanation"
                className="form-control"
                rows={2}
                placeholder="Why is this the correct answer?"
                value={form.explanation}
                onChange={e => update('explanation', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} id="save-question-btn">
                <MdSave size={18} /> {editingId ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(3px)', padding: '1rem',
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 440, animation: 'slideUp 0.25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <MdWarning size={48} color="var(--danger)" />
              <h3 style={{ margin: '0.75rem 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Delete Question?</h3>
              <p className="text-sm text-secondary" style={{ marginBottom: '0.75rem', lineHeight: 1.6 }}>
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '0.75rem',
                textAlign: 'left', marginBottom: '1.25rem', border: '1px solid var(--border-light)'
              }}>
                <p className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Question:</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {deleteTarget.question.length > 120 ? deleteTarget.question.slice(0, 120) + '...' : deleteTarget.question}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  className="btn"
                  style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
                  onClick={confirmDelete}
                  id="confirm-delete-btn"
                >
                  <MdDelete size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
