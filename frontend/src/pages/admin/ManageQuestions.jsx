import { useState } from 'react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { aptitudeQuestions } from '../../data/appData';

export default function ManageQuestions() {
  const [category, setCategory] = useState('Quantitative');
  const categories = Object.keys(aptitudeQuestions);
  const questions = aptitudeQuestions[category];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Questions</h1>
          <p>Add, edit or remove mock interview and aptitude questions.</p>
        </div>
        <button className="btn btn-primary">
          <MdAdd size={20} /> Add New Question
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
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
              {questions.map((q, i) => (
                <tr key={q.id}>
                  <td className="font-semibold text-muted">{i + 1}</td>
                  <td>
                    <p className="font-medium text-sm">{q.question}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <span key={oIdx} className="text-xs text-secondary">
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
                      <button className="btn-icon" style={{ color: 'var(--primary)' }}><MdEdit size={18} /></button>
                      <button className="btn-icon text-danger"><MdDelete size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
