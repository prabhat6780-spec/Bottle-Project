import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleUser, updateUserStatus } from '../redux/slices/userSlice';
import Swal from 'sweetalert2';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleUser: user, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchSingleUser(id));
  }, [dispatch, id]);

  const toggleStatus = () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    Swal.fire({
      title: `Make ${newStatus.toUpperCase()}?`,
      text: `User will be marked as ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.status === 'active' ? '#e91e63' : '#007236',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${newStatus}`
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(updateUserStatus({ id, status: newStatus })).then((res) => {
          if (!res.error) {
            Swal.fire('Updated!', `User is now ${newStatus}.`, 'success');
          } else {
            Swal.fire('Error!', res.payload || 'Failed to update status.', 'error');
          }
        });
      }
    });
  };

  if (loading && !user) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  if (!user) return <div className="p-5 text-center text-muted">User not found</div>;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-detail-page-header">
        <Link to="/users" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <h1 className="page-title">User Detailed</h1>
      </div>

      <div className="user-detail-mobile dash-card mt-4">
        <div className="dash-card-body p-4">
          <div className="user-detail-mobile-profile text-center mb-4">
            <div className="user-detail-mobile-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="h5 mb-1 mt-3">{user.name}</h2>
            <p className="text-muted small mb-0">{user.email}</p>
          </div>
          <div className="user-detail-mobile-grid">
            <div className="user-detail-mobile-field">
              <span className="user-detail-mobile-label">Role</span>
              <span>{typeof user.role === 'object' ? user.role.name : (user.role || 'N/A')}</span>
            </div>
            <div className="user-detail-mobile-field">
              <span className="user-detail-mobile-label">Status</span>
              <span className={`badge-status badge-${user.status || 'pending'}`} style={{ fontSize: 11, borderRadius: 4 }}>
                {(user.status || 'pending').toUpperCase()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleStatus}
            disabled={loading}
            className={`btn w-100 mt-4 ${user.status === 'active' ? 'btn-danger' : 'btn-success'} py-2 fw-bold text-uppercase`}
            style={{ fontSize: 12, borderRadius: 6, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            {loading ? 'Processing...' : (user.status === 'active' ? 'MAKE INACTIVE' : 'MAKE ACTIVE')}
          </button>
        </div>
      </div>

      <div className="user-detail-desktop dash-card mt-4">
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11, letterSpacing: 1 }}>Name</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11, letterSpacing: 1 }}>Email</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11, letterSpacing: 1 }}>Role</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11, letterSpacing: 1 }}>Status</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11, letterSpacing: 1 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 fw-600" style={{ fontSize: 15 }}>{user.name}</td>
                  <td className="px-4 py-4 text-muted" style={{ fontSize: 15 }}>{user.email}</td>
                  <td className="px-4 py-4 text-muted" style={{ fontSize: 15 }}>
                    {typeof user.role === 'object' ? user.role.name : (user.role || 'N/A')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge-status badge-${user.status || 'pending'}`} style={{ fontSize: 11, borderRadius: 4 }}>
                      {(user.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={toggleStatus}
                      disabled={loading}
                      className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm px-3 py-2 fw-bold text-uppercase`}
                      style={{ fontSize: 12, borderRadius: 6, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                      {loading ? 'Processing...' : (user.status === 'active' ? 'MAKE INACTIVE' : 'MAKE ACTIVE')}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
