import { useState, useEffect } from 'react';
import { MdPeople, MdPsychology, MdCardMembership, MdQuiz } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/mockService';
import StatCard from '../../components/dashboard/StatCard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview and key metrics.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="text-sm font-semibold">Welcome, {user?.name}</p>
          <p className="text-xs text-muted">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)
        ) : (
          <>
            <StatCard icon={MdPeople} label="Total Students" value={stats?.totalStudents} color="#2563EB" bg="#EFF6FF" trend="Active" />
            <StatCard icon={MdPsychology} label="Mock Interviews" value={stats?.totalInterviews} color="#10B981" bg="#ECFDF5" trend="Completed" />
            <StatCard icon={MdQuiz} label="Aptitude Tests" value={stats?.totalAptitudeAttempts} color="#F59E0B" bg="#FFFBEB" trend="Taken" />
            <StatCard icon={MdCardMembership} label="Certificates" value={stats?.totalCertificates} color="#7C3AED" bg="#F5F3FF" trend="Uploaded" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Registrations</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>College</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-4"><span className="spinner" /></td></tr>
                ) : stats?.recentStudents.length === 0 ? (
                  <tr><td colSpan="3" className="text-center text-muted">No recent students</td></tr>
                ) : (
                  stats?.recentStudents.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar avatar-sm">{s.avatar}</div>
                          <span className="font-medium text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="text-sm">{s.college}</td>
                      <td className="text-sm text-muted">{new Date(s.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Platform Analytics</h3>
          </div>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 250 }}>
            <MdPsychology size={64} color="var(--primary-200)" style={{ marginBottom: '1rem' }} />
            <p className="font-semibold">Average Interview Score</p>
            <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>
              {stats?.avgInterviewScore || 0}%
            </p>
            <p className="text-sm text-muted mt-2">Across all students</p>
          </div>
        </div>
      </div>
    </div>
  );
}
