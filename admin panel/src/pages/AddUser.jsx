import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/slices/userSlice';
import { fetchRoles } from '../redux/slices/roleSlice';
import Swal from 'sweetalert2';

export default function AddUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.users);
  const { roles } = useSelector((state) => state.roles);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (roles.length > 0 && !formData.role) {
      setFormData(prev => ({ ...prev, role: roles[0]._id }));
    }
  }, [roles, formData.role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) return Swal.fire('Error', 'Please select a role', 'error');

    dispatch(addUser(formData)).then((res) => {
      if (!res.error) {
        Swal.fire('Success!', 'User created successfully.', 'success');
        navigate('/users');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to create user.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/users" className="btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Add New User</h1>
          <p className="page-subtitle">Create a new team member account</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">User Information</span>
            </div>
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-person text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control custom-input-field"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-envelope text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control custom-input-field"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-shield-lock text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control custom-input-field"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">User Role</label>
                    <div className="d-flex flex-wrap gap-3">
                      {roles.map((role) => (
                        <div key={role._id} style={{ minWidth: '140px' }} className="flex-fill">
                          <input
                            type="radio"
                            className="btn-check"
                            name="role"
                            id={`role-${role._id}`}
                            checked={formData.role === role._id}
                            onChange={() => setFormData({ ...formData, role: role._id })}
                          />
                          <label className={`btn btn-outline-light w-100 py-3 d-flex flex-column align-items-center gap-2 ${formData.role === role._id ? 'active-role' : 'inactive-role'}`} htmlFor={`role-${role._id}`} style={{ borderRadius: 12, borderWidth: 2, transition: 'all 0.2s' }}>
                            <i className={`bi ${role.name === 'Admin' ? 'bi-shield-check' : role.name === 'Manager' ? 'bi-person-badge' : 'bi-person'} fs-4`} />
                            <span className="fw-bold">{role.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Account Status</label>
                    <select
                      className="form-select custom-input-field"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill me-2" /> Create User
                      </>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/users')} className="btn-ghost px-5 py-3">
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
