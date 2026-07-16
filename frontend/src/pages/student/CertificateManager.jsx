import { useState, useEffect, useRef } from 'react';
import { MdUpload, MdDelete, MdPictureAsPdf, MdImage, MdInsertDriveFile } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/mockService';
import './CertificateManager.css';

export default function CertificateManager() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({ name: '', issuer: '', issueDate: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getAll(user.id);
      setCertificates(data);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error('File size must be under 2MB'); return; }
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.issuer || !formData.issueDate || !file) {
      toast.warning('Please fill all fields and select a file');
      return;
    }
    setUploading(true);
    try {
      const newCert = await certificateService.upload(user.id, {
        ...formData,
        fileName: file.name,
        fileType: file.type,
      });
      setCertificates(prev => [...prev, newCert]);
      toast.success('Certificate uploaded successfully!');
      setFormData({ name: '', issuer: '', issueDate: '' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error('Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await certificateService.delete(user.id, certId);
      setCertificates(prev => prev.filter(c => c.id !== certId));
      toast.success('Certificate deleted');
    } catch (err) {
      toast.error('Failed to delete certificate');
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <MdPictureAsPdf size={40} color="#EF4444" />;
    if (type.includes('image')) return <MdImage size={40} color="#3B82F6" />;
    return <MdInsertDriveFile size={40} color="#64748B" />;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Certificate Manager</h1>
        <p>Manage your professional certificates and showcase them to recruiters.</p>
      </div>

      <div className="cert-layout">
        {/* Upload Form */}
        <div className="card h-fit">
          <div className="card-header">
            <h3 className="card-title">Add New Certificate</h3>
          </div>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Certificate Name</label>
              <input type="text" className="form-control" placeholder="e.g. AWS Cloud Practitioner" 
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Issuing Organization</label>
              <input type="text" className="form-control" placeholder="e.g. Amazon Web Services" 
                value={formData.issuer} onChange={e => setFormData({ ...formData, issuer: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input type="date" className="form-control" 
                value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Document (PDF/Image)</label>
              <div 
                className="cert-file-upload" 
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: file ? 'var(--primary)' : 'var(--border)' }}
              >
                <input type="file" ref={fileInputRef} onChange={handleFile} accept=".pdf,image/*" style={{ display: 'none' }} />
                {file ? (
                  <p className="font-medium text-primary-color text-sm">{file.name}</p>
                ) : (
                  <>
                    <MdUpload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs text-muted">Max size: 2MB</p>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={uploading}>
              {uploading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/> Uploading...</> : 'Upload Certificate'}
            </button>
          </form>
        </div>

        {/* Certificate Grid */}
        <div>
          {loading ? (
            <div className="cert-grid">
              {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
            </div>
          ) : certificates.length === 0 ? (
            <div className="empty-state card h-full">
              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🎓</div>
              <h3>No certificates yet</h3>
              <p>Upload your technical and extra-curricular certificates here to build your portfolio.</p>
            </div>
          ) : (
            <div className="cert-grid">
              {certificates.map(cert => (
                <div key={cert.id} className="card cert-card animate-fadeIn">
                  <div className="cert-card-top">
                    <div className="cert-icon-bg">
                      {getFileIcon(cert.fileType)}
                    </div>
                    <button className="btn-icon text-danger" onClick={() => handleDelete(cert.id)} title="Delete Certificate">
                      <MdDelete size={20} />
                    </button>
                  </div>
                  <h4 className="font-semibold" style={{ fontSize: '1.0625rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{cert.name}</h4>
                  <p className="text-sm text-secondary" style={{ marginBottom: '0.5rem' }}>{cert.issuer}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className="text-xs text-muted">Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    <span className="badge badge-success">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
