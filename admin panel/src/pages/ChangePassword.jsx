import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../redux/slices/loginSlice';
import Swal from 'sweetalert2';

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return Swal.fire('Error', 'New passwords do not match', 'error');
    }

    if (formData.newPassword.length < 6) {
      return Swal.fire('Error', 'Password must be at least 6 characters', 'warning');
    }

    const res = await dispatch(changePassword({ 
      oldPassword: formData.oldPassword, 
      newPassword: formData.newPassword 
    }));

    if (!res.error) {
      Swal.fire({
        title: 'Success!',
        text: 'Your password has been updated.',
        icon: 'success',
        confirmButtonColor: '#7c4dff'
      });
      navigate('/'); // Go back to dashboard
    } else {
      Swal.fire('Error', res.payload || 'Failed to update password', 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Security Settings</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-lg-6">
          <div className="dash-card border-0 shadow-sm" style={{ borderRadius: 24 }}>
            <div className="dash-card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="bg-light d-inline-flex p-3 rounded-circle mb-3">
                  <i className="bi bi-shield-lock text-accent" style={{ fontSize: 32 }} />
                </div>
                <h3 className="fw-bold">Change Password</h3>
                <p className="text-muted">Ensure your account is using a long, random password to stay secure.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">Old Password</label>
                  <input
                    type="password"
                    className="form-control custom-input-field"
                    required
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    style={{ borderRadius: 12 }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input-field"
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    style={{ borderRadius: 12 }}
                  />
                </div>

                <div className="mb-5">
                  <label className="form-label fw-600 small text-uppercase text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input-field"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={{ borderRadius: 12 }}
                  />
                </div>

                <div className="d-grid gap-3">
                  <button type="submit" className="btn-accent py-3 rounded-4 shadow-sm fw-bold" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" /> Updating...</>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/')} className="btn-ghost py-3 rounded-4">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
