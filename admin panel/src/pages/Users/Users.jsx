import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Can } from '../../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../../redux/slices/userSlice';
import Swal from 'sweetalert2';

const avatarColors = [
  'linear-gradient(135deg,#00aeef,#008ecc)',
  'linear-gradient(135deg,#007236,#008b45)',
  'linear-gradient(135deg,#ffcc00,#ffb300)',
  'linear-gradient(135deg,#e91e63,#c2185b)',
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
];

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user: ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser(id)).then((res) => {
          if (!res.error) {
            Swal.fire('Deleted!', 'User has been removed.', 'success');
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete user.', 'error');
          }
        });
      }
    });
  };

  const filteredAndSorted = useMemo(() => {
    let result = Array.isArray(users) ? [...users] : [];

    result = result.filter(u => {
      const name = u.name || '';
      const email = u.email || '';
      const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || u.status === filter;
      return matchSearch && matchFilter;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle role object
        if (sortConfig.key === 'role') {
          valA = a.role ? a.role.name : '';
          valB = b.role ? b.role.name : '';
        }

        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, search, filter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSorted.length / entries);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * entries, currentPage * entries);

  const roleBadgeStyle = (roleName) => ({
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11.5,
    fontWeight: 600,
    background: roleName === 'Admin' ? 'rgba(0,174,239,0.1)' : roleName === 'Manager' ? 'rgba(0,114,54,0.08)' : 'rgba(233,30,99,0.08)',
    color: roleName === 'Admin' ? '#00aeef' : roleName === 'Manager' ? '#007236' : '#e91e63',
  });

  if (loading && users.length === 0) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between users-page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage team members and permissions</p>
        </div>
        <Can I="manage" a="User">
          <Link to="/users/add" className="btn-accent">
            <i className="bi bi-person-plus-fill" /> Add User
          </Link>
        </Can>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: users.length, icon: 'bi-people-fill', color: 'purple' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: 'bi-person-check-fill', color: 'green' },
          { label: 'Inactive', value: users.filter(u => u.status === 'inactive').length, icon: 'bi-person-dash-fill', color: 'orange' },
          { label: 'Pending', value: users.filter(u => u.status === 'pending').length, icon: 'bi-hourglass-split', color: 'teal' },
        ].map((c, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className={`stat-card ${c.color}`}>
              <div className={`stat-icon ${c.color}`}><i className={`bi ${c.icon}`} /></div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card">
        <div className="dash-card-header d-flex align-items-center justify-content-between flex-wrap gap-3 users-dash-toolbar">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show</span>
            <select
              className="form-select form-select-sm entries-select"
              value={entries}
              onChange={(e) => { setEntries(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>entries</span>
          </div>

          <div className="d-flex gap-2 flex-wrap ms-auto">
            <div className="search-input-wrapper" style={{ minWidth: 240 }}>
              <i className="bi bi-search" />
              <input
                type="text"
                className="search-input"
                placeholder="Search users..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="btn-group">
              {['all', 'active', 'inactive', 'pending'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setCurrentPage(1); }}
                  className={`btn ${filter === f ? 'btn-accent' : 'btn-ghost'} py-1 px-3`}
                  style={{ fontSize: 12, textTransform: 'capitalize' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="users-list-mobile">
          {paginatedData.map((u, i) => (
            <div key={u._id} className="users-mobile-card">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="users-mobile-avatar"
                  style={{ background: avatarColors[i % avatarColors.length] }}
                >
                  {u.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate">{u.name}</div>
                  <div className="small text-muted text-truncate">{u.email}</div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                    {u.role ? (
                      <span style={roleBadgeStyle(u.role.name)}>{u.role.name}</span>
                    ) : (
                      <span className="text-muted small">No Role</span>
                    )}
                    <span className={`badge-status badge-${u.status || 'pending'}`}>
                      {(u.status || 'pending').charAt(0).toUpperCase() + (u.status || 'pending').slice(1)}
                    </span>
                  </div>
                  <div className="small text-muted mt-1">
                    Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="users-mobile-actions">
                <Link to={`/users/view/${u._id}`} className="topbar-btn users-mobile-action-btn" title="View Details">
                  <i className="bi bi-eye" />
                </Link>
                <Can I="manage" a="User">
                  <Link to={`/users/edit/${u._id}`} className="topbar-btn users-mobile-action-btn" title="Edit">
                    <i className="bi bi-pencil-square" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(u._id, u.name)}
                    className="topbar-btn users-mobile-action-btn users-mobile-action-danger"
                    title="Delete"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </Can>
              </div>
            </div>
          ))}
          {paginatedData.length === 0 && !loading && (
            <div className="users-mobile-empty">
              <i className="bi bi-search" />
              No matching users found
            </div>
          )}
        </div>

        <div className="users-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  User {sortConfig.key === 'name' && <i className={`bi bi-sort-alpha-${sortConfig.direction === 'asc' ? 'down' : 'up'} ms-1`} />}
                </th>
                <th onClick={() => handleSort('role')} className="sortable">
                  Role {sortConfig.key === 'role' && <i className={`bi bi-sort-alpha-${sortConfig.direction === 'asc' ? 'down' : 'up'} ms-1`} />}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {sortConfig.key === 'status' && <i className={`bi bi-sort-alpha-${sortConfig.direction === 'asc' ? 'down' : 'up'} ms-1`} />}
                </th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Joined {sortConfig.key === 'createdAt' && <i className={`bi bi-sort-numeric-${sortConfig.direction === 'asc' ? 'down' : 'up'} ms-1`} />}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((u, i) => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: avatarColors[i % avatarColors.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, flexShrink: 0, color: 'white',
                      }}>{u.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.role ? (
                      <span style={roleBadgeStyle(u.role.name)}>{u.role.name}</span>
                    ) : (
                      <span className="text-muted small">No Role</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-status badge-${u.status || 'pending'}`}>
                      {(u.status || 'pending').charAt(0).toUpperCase() + (u.status || 'pending').slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/users/view/${u._id}`} className="topbar-btn" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }} title="View Details">
                        <i className="bi bi-eye" />
                      </Link>
                      <Can I="manage" a="User">
                        <Link to={`/users/edit/${u._id}`} className="topbar-btn" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                          <i className="bi bi-pencil-square" />
                        </Link>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="topbar-btn"
                          style={{ width: 32, height: 32, borderRadius: 8, color: 'var(--danger)' }}
                          title="Delete"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                    <i className="bi bi-search" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                    No matching users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-light-subtle users-dash-footer" style={{ borderTop: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredAndSorted.length > 0 ? (currentPage - 1) * entries + 1 : 0}</strong> to <strong>{Math.min(currentPage * entries, filteredAndSorted.length)}</strong> of <strong>{filteredAndSorted.length}</strong> entries
          </span>
          <div className="pagination-container d-flex gap-1">
            <button
              className={`btn btn-sm btn-ghost ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`btn btn-sm ${currentPage === i + 1 ? 'btn-accent' : 'btn-ghost'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`btn btn-sm btn-ghost ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
