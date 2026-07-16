import { useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle, MdMenuBook, MdLightbulb } from 'react-icons/md';
import { companyData } from '../../data/appData';
import './CompanyDetail.css';

export default function CompanyDetail() {
  const { companyId } = useParams();
  const company = companyData.find(c => c.id === companyId);

  if (!company) {
    return (
      <div className="page-container text-center">
        <h2>Company not found</h2>
        <Link to="/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Companies</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <Link to="/companies" className="text-sm font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <MdArrowBack /> Back to All Companies
      </Link>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)', background: company.bgColor, color: company.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
          {company.name[0]}
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{company.name}</h1>
          <p className="text-secondary">{company.fullName}</p>
        </div>
      </div>

      <div className="cd-grid">
        <div className="cd-main">
          {/* Selection Process */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title"><MdCheckCircle size={20} color="var(--primary)" style={{ verticalAlign: 'text-bottom', marginRight: '0.5rem' }}/> Selection Process</h3>
            </div>
            <div className="process-timeline">
              {company.selectionProcess.map((step, i) => (
                <div key={i} className="process-step">
                  <div className="process-num">{step.step}</div>
                  <div className="process-content">
                    <h4 className="font-semibold text-primary-color">{step.title}</h4>
                    <p className="text-sm text-secondary" style={{ marginTop: '0.25rem' }}>{step.desc}</p>
                    <span className="badge badge-neutral" style={{ marginTop: '0.5rem' }}>{step.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus / Topics */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MdMenuBook size={20} color="var(--success)" style={{ verticalAlign: 'text-bottom', marginRight: '0.5rem' }}/> Topics to Prepare</h3>
            </div>
            <div className="topics-list">
              {company.topics.map((topic, i) => (
                <div key={i} className="topic-group">
                  <h4 className="font-semibold" style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{topic.category}</h4>
                  <ul className="topic-items">
                    {topic.items.map((item, j) => (
                      <li key={j} className="text-sm text-secondary">
                        <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cd-sidebar">
          {/* Quick Stats */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="font-semibold" style={{ marginBottom: '1rem' }}>Quick Facts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="fact-item"><span className="text-muted text-sm">Package</span><span className="font-medium text-sm">{company.package}</span></div>
              <div className="fact-item"><span className="text-muted text-sm">Founded</span><span className="font-medium text-sm">{company.founded}</span></div>
              <div className="fact-item"><span className="text-muted text-sm">Employees</span><span className="font-medium text-sm">{company.employees}</span></div>
              <div className="fact-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="text-muted text-sm" style={{ marginBottom: '0.25rem' }}>Locations</span>
                <span className="font-medium text-sm">{company.locations}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{ background: 'var(--warning-light)', borderColor: '#FDE68A' }}>
            <h3 className="font-semibold" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400E' }}>
              <MdLightbulb size={20} /> Pro Tips
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {company.tips.map((tip, i) => (
                <li key={i} className="text-sm" style={{ color: '#92400E', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>💡</span> {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <Link to="/interview" className="btn btn-primary w-full btn-lg" style={{ marginTop: '1.5rem' }}>
            Practice Mock Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
