import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addPermission, updatePermission, fetchPermissions } from '../../redux/slices/permissionSlice';
import Swal from 'sweetalert2';

export default function CreatePermission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => state.permissions);
  
  const [permissionName, setPermissionName] = useState('');
  const [error, setError] = useState('');

  const validateField = (value) => {
    let msg = '';
    if (!value) {
      msg = 'Permission Name is mandatory';
    } else if (/\s/.test(value)) {
      msg = 'Whitespace is not allowed';
    } else if (!/^[a-z]+-[a-z]+$/.test(value)) {
      msg = 'Invalid format. Use action-subject (e.g., edit-brand)';
    }
    setError(msg);
    return msg;
  };

  const handleBlur = () => {
    const msg = validateField(permissionName);
    if (msg) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Warning',
        text: msg,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\s/g, '').toLowerCase();
    setPermissionName(value);
    if (error) setError('');
  };

  useEffect(() => {
    if (id) {
      if (permissions.length === 0) {
        dispatch(fetchPermissions());
      } else {
        const p = permissions.find(item => item._id === id);
        if (p) setPermissionName(p.name);
      }
    }
  }, [id, permissions, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validateField(permissionName);
    if (msg) return Swal.fire('Validation Error', msg, 'error');

    if (id) {
      dispatch(updatePermission({ id, name: permissionName })).then(res => {
        if (!res.error) {
          Swal.fire('Updated!', 'Permission updated successfully.', 'success');
          navigate('/permissions');
        } else {
          Swal.fire('Error!', res.payload || 'Failed to update.', 'error');
        }
      });
    } else {
      dispatch(addPermission(permissionName)).then(res => {
        if (!res.error) {
          Swal.fire('Created!', 'Permission created successfully.', 'success');
          navigate('/permissions');
        } else {
          Swal.fire('Error!', res.payload || 'Failed to create.', 'error');
        }
      });
    }
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 mb-4 brand-form-page-header">
        <Link to="/permissions" className="btn-ghost brand-form-back" style={{ width: 40, height: 40, padding: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div className="min-w-0">
          <h1 className="page-title mb-1">{id ? 'Edit Permission' : 'Add Permission'}</h1>
          <p className="page-subtitle">{id ? 'Modify existing system permission' : 'Create a new capability for the system'}</p>
        </div>
      </div>

      <div className="row justify-content-center g-0 g-sm-3">
        <div className="col-12 col-lg-6">
          <div className="dash-card border-0 shadow-sm brand-form-card" style={{ borderRadius: 20 }}>
            <div className="dash-card-header bg-white border-bottom p-4">
              <span className="dash-card-title fw-bold">Permission Information</span>
            </div>
            <div className="dash-card-body p-4 brand-form-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted mb-2">
                      Permission Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control custom-input-field p-3 ${error ? 'is-invalid' : ''}`}
                      placeholder="e.g. edit-brand"
                      value={permissionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                      required
                    />
                    {error && <div className="invalid-feedback">{error}</div>}
                    <div className="form-text small text-muted mt-2">
                      Use format: <code>action-subject</code> (e.g., <code>edit-brand</code>, <code>delete-user</code>)
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-5 brand-form-actions">
                  <button type="submit" className="btn-accent py-3 rounded-3 flex-grow-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Permission'}
                  </button>
                  <button type="button" className="btn-ghost py-3 rounded-3" onClick={() => navigate('/permissions')}>
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
