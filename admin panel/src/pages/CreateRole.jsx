import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions } from '../redux/slices/permissionSlice';
import { createRole, updateRole, fetchRoles } from '../redux/slices/roleSlice';
import Swal from 'sweetalert2';

export default function CreateRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { permissions, loading: permissionsLoading } = useSelector((state) => state.permissions);
  const { roles, loading: rolesLoading } = useSelector((state) => state.roles);
  
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    dispatch(fetchPermissions());
    if (id) {
      // If roles aren't loaded, fetch them first
      if (roles.length === 0) {
        dispatch(fetchRoles());
      }
    }
  }, [dispatch, id, roles.length]);

  useEffect(() => {
    if (id && roles.length > 0) {
      const role = roles.find(r => r._id === id);
      if (role) {
        setRoleName(role.name);
        setSelectedPermissions(role.permissions.map(p => typeof p === 'object' ? p._id : p));
      }
    }
  }, [id, roles]);

  const handleTogglePermission = (pId) => {
    if (selectedPermissions.includes(pId)) {
      setSelectedPermissions(selectedPermissions.filter(item => item !== pId));
    } else {
      setSelectedPermissions([...selectedPermissions, pId]);
    }
  };

  const handleSubmit = () => {
    if (!roleName) return Swal.fire('Error', 'Role name is required', 'error');
    if (selectedPermissions.length === 0) return Swal.fire('Error', 'At least one permission must be selected', 'error');

    const roleData = {
      name: roleName,
      permissions: selectedPermissions
    };

    const action = id ? updateRole({ id, roleData }) : createRole(roleData);

    dispatch(action).then((res) => {
      if (!res.error) {
        Swal.fire('Success!', `Role ${id ? 'updated' : 'created'} successfully`, 'success');
        navigate('/roles');
      } else {
        Swal.fire('Error', res.payload || 'Operation failed', 'error');
      }
    });
  };

  if (permissionsLoading || (id && rolesLoading)) {
    return (
      <div className="page-content rbac-role-page d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content rbac-role-page">
      <div className="page-header d-flex align-items-center gap-3 brand-form-page-header mb-4">
        <Link to="/roles" className="btn-ghost brand-form-back" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div className="min-w-0">
          <h1 className="page-title mb-0">{id ? 'Edit Role' : 'Create Role'}</h1>
          <p className="page-subtitle mb-0">Assign permissions to this role</p>
        </div>
      </div>

      <div className="dash-card border-0 shadow-sm brand-form-card rbac-role-form-card">
        <div className="dash-card-body p-4 brand-form-body">
          <div className="mb-4">
            <label className="form-label small fw-500 text-muted mb-2">Role<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control custom-input-field rbac-role-name-input"
              placeholder="e.g. Staff"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              style={{ borderRadius: 12, height: 42 }}
            />
          </div>

          <div className="mb-3 mt-4">
            <label className="form-label small fw-500 text-muted">Permissions:</label>
          </div>

          <div className="row g-2 g-sm-3 rbac-permissions-grid">
            {permissions.map((p) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-2" key={p._id}>
                <div className="rbac-permission-item form-check form-switch d-flex align-items-start gap-2 p-2 rounded-3">
                  <input
                    className="form-check-input shadow-none cursor-pointer flex-shrink-0 mt-1"
                    type="checkbox"
                    role="switch"
                    id={`switch-${p._id}`}
                    checked={selectedPermissions.includes(p._id)}
                    onChange={() => handleTogglePermission(p._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label small text-muted cursor-pointer rbac-permission-label mb-0" htmlFor={`switch-${p._id}`}>
                    {p.name}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-2 d-flex gap-2 brand-form-actions rbac-form-actions">
            <button type="button" className="btn rbac-btn-submit py-3 flex-grow-1 border-0 shadow-sm" onClick={handleSubmit}>
              Submit
            </button>
            <button type="button" className="btn rbac-btn-cancel py-3 border-0 shadow-sm" onClick={() => navigate('/roles')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


