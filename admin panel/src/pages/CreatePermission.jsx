import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addPermission, updatePermission, fetchPermissions } from '../redux/slices/permissionSlice';
import Swal from 'sweetalert2';

export default function CreatePermission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => state.permissions);
  
  const [permissionName, setPermissionName] = useState('');

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
    if (!permissionName.trim()) return Swal.fire('Error', 'Please enter a permission name', 'error');

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
      <div className="page-header d-flex align-items-center gap-3 mb-4">
        <Link to="/permissions" className="btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title mb-1">{id ? 'Edit Permission' : 'Add Permission'}</h1>
          <p className="page-subtitle">{id ? 'Modify existing system permission' : 'Create a new capability for the system'}</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card border-0 shadow-sm" style={{ borderRadius: 20 }}>
            <div className="dash-card-header bg-white border-bottom p-4">
              <span className="dash-card-title fw-bold">Permission Information</span>
            </div>
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted mb-2">Permission Name</label>
                    <input 
                      type="text" 
                      className="form-control custom-input-field p-3" 
                      placeholder="e.g. create-user"
                      value={permissionName}
                      onChange={(e) => setPermissionName(e.target.value)}
                      style={{ borderRadius: 12 }}
                      required
                    />
                    <div className="form-text small text-muted mt-2">
                      Use format: <code>action-subject</code> (e.g., <code>edit-brand</code>)
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 rounded-3 flex-grow-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Permission'}
                  </button>
                  <button type="button" className="btn-ghost px-5 py-3 rounded-3" onClick={() => navigate('/permissions')}>
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
