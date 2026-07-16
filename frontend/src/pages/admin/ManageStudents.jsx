import { useState, useEffect } from 'react';
import { MdDelete, MdSearch } from 'react-icons/md';
import { toast } from 'react-toastify';
import { adminService } from '../../services/mockService';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllStudents();
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account?')) return;
    try {
      await adminService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student removed successfully');
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Students</h1>
          <p>View and manage registered student accounts.</p>
        </div>
        <div className="navbar-search" style={{ width: 300 }}>
          <MdSearch size={18} className="search-icon" />
          <input 
            type="search" 
            placeholder="Search students..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Academic Info</th>
                <th>Progress</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8"><span className="spinner spinner-lg" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <h3>No Students Found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar avatar-md">{s.avatar}</div>
                        <div>
                          <p className="font-semibold text-sm">{s.name}</p>
                          <p className="text-xs text-muted">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">{s.college}</p>
                      <p className="text-xs text-secondary">{s.branch} • {s.year}</p>
                    </td>
                    <td style={{ minWidth: 150 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span className="text-xs font-medium">Placement Ready</span>
                        <span className="text-xs text-primary-color font-bold">{s.placementProgress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${s.placementProgress || 0}%` }} />
                      </div>
                    </td>
                    <td className="text-sm text-secondary">{new Date(s.joinedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(s.id)} title="Delete Student">
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
