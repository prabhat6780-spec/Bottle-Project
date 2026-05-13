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
      <div className="page-content bg-white d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content bg-white" style={{ minHeight: '100vh' }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/roles" className="btn btn-light border-light-subtle d-flex align-items-center justify-content-center p-0" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff' }}>
            <i className="bi bi-arrow-left text-muted" style={{ fontSize: '18px' }} />
          </Link>
          <h1 className="page-title mb-0" style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
            {id ? 'Edit Role' : 'Create Role'}
          </h1>
        </div>

        <div className="dash-card border-0 shadow-none p-0">
          <div className="mb-4">
            <label className="form-label small fw-500 text-muted mb-2">Role<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle shadow-none"
              placeholder="e.g. Staff"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              style={{ borderRadius: '4px', maxWidth: '500px', height: '35px' }}
            />
          </div>

          <div className="mb-3 mt-5">
            <label className="form-label small fw-500 text-muted">Permissions:</label>
          </div>

          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6">
            {permissions.map((p) => (
              <div className="col" key={p._id}>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <input
                    className="form-check-input shadow-none cursor-pointer"
                    type="checkbox"
                    role="switch"
                    id={`switch-${p._id}`}
                    checked={selectedPermissions.includes(p._id)}
                    onChange={() => handleTogglePermission(p._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label small text-muted cursor-pointer text-nowrap" htmlFor={`switch-${p._id}`} style={{ fontSize: '12px' }}>
                    {p.name}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 d-flex gap-2">
            <button className="btn btn-success px-4 py-2 border-0 shadow-sm" style={{ borderRadius: '4px', fontSize: '13px', fontWeight: '500', backgroundColor: '#4caf50' }} onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn btn-danger px-4 py-2 border-0 shadow-sm" style={{ borderRadius: '4px', fontSize: '13px', fontWeight: '500', backgroundColor: '#f44336' }} onClick={() => navigate('/roles')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


