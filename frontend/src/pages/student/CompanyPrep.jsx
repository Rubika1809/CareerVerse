import { Link } from 'react-router-dom';
import { MdArrowForward, MdLocationOn, MdPeople, MdAttachMoney } from 'react-icons/md';
import { companyData } from '../../data/appData';
import './CompanyPrep.css';

export default function CompanyPrep() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Company Preparation</h1>
        <p>Get detailed selection processes, interview topics, and tips for top recruiters.</p>
      </div>

      <div className="company-grid">
        {companyData.map(c => (
          <div key={c.id} className="card company-prep-card">
            <div className="company-prep-header">
              <div className="company-prep-avatar" style={{ background: c.bgColor, color: c.color }}>
                {c.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-xs text-muted">{c.fullName}</p>
              </div>
            </div>

            <div className="company-prep-stats">
              <div className="cp-stat"><MdAttachMoney size={16} /> {c.package}</div>
              <div className="cp-stat"><MdLocationOn size={16} /> {c.locations.split(',')[0]} +More</div>
              <div className="cp-stat"><MdPeople size={16} /> {c.employees}</div>
            </div>

            <p className="company-prep-desc">{c.description}</p>

            <Link to={`/companies/${c.id}`} className="btn btn-primary w-full" style={{ marginTop: 'auto' }}>
              View Prep Guide <MdArrowForward size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
