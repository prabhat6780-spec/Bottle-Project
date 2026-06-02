import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions, deletePermission } from '../redux/slices/permissionSlice';
import Swal from 'sweetalert2';

export default function PermissionList() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => state.permissions);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete the "${name}" permission?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      borderRadius: 15
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deletePermission(id)).then(res => {
          if (!res.error) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Permission has been removed.',
              icon: 'success',
              borderRadius: 15
            });
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
          }
        });
      }
    });
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [permissions, search]);

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPermissions.slice(start, start + itemsPerPage);
  }, [filteredPermissions, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const avatarColors = [
    'linear-gradient(135deg,#e91e63,#c2185b)',
    'linear-gradient(135deg,#00aeef,#008ecc)',
    'linear-gradient(135deg,#007236,#008b45)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
  ];

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between mb-4 companies-page-header">
        <div>
          <h1 className="page-title mb-1">System Permissions</h1>
          <p className="page-subtitle mb-0">Total permissions found: {permissions.length}</p>
        </div>
        <Link to="/permissions/create" className="btn-accent shadow-sm px-4 py-2 rounded-3 companies-header-action">
          <i className="bi bi-shield-plus me-2" /> Add Permission
        </Link>
      </div>

      <div className="dash-card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 20 }}>
        <div className="dash-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white companies-dash-toolbar">
          <div className="d-flex align-items-center gap-2 text-muted small fw-500">
            <span>Show</span>
            <select 
              className="form-select form-select-sm shadow-none border-light-subtle bg-light" 
              style={{ width: 70, borderRadius: 8, cursor: 'pointer' }}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-input-wrapper position-relative companies-search-wrap">
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
              placeholder="Search permissions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-mobile">
          {paginatedItems.map((permission, index) => (
            <div key={permission._id} className="companies-mobile-card rbac-mobile-card">
              <div className="d-flex align-items-start gap-3 w-100 min-w-0">
                <div
                  className="companies-mobile-avatar"
                  style={{ background: avatarColors[index % avatarColors.length] }}
                >
                  <i className="bi bi-key-fill" />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="text-muted small fw-bold mb-1">
                    #{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                  </div>
                  <span className="badge-permission d-inline-block" style={{ wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
                    {permission.name}
                  </span>
                </div>
              </div>
              <div className="companies-mobile-actions rbac-mobile-actions">
                <Link
                  to={`/permissions/edit/${permission._id}`}
                  className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn"
                  title="Edit Permission"
                >
                  <i className="bi bi-pencil-square fs-6" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(permission._id, permission.name)}
                  className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn"
                  title="Delete Permission"
                >
                  <i className="bi bi-trash fs-6" />
                </button>
              </div>
            </div>
          ))}
          {paginatedItems.length === 0 && !loading && (
            <div className="companies-mobile-empty">No permissions found</div>
          )}
        </div>

        <div className="companies-list-desktop table-responsive">
          <table className="data-table mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Permission Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {paginatedItems.map((permission, index) => (
                <tr key={permission._id} className="align-middle hover-bg-light transition-all border-bottom">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center fw-600 text-dark">
                    <span className="badge-permission">
                      {permission.name}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Link to={`/permissions/edit/${permission._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit Permission">
                        <i className="bi bi-pencil-square fs-6" />
                      </Link>
                      <button onClick={() => handleDelete(permission._id, permission.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete Permission">
                        <i className="bi bi-trash fs-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No permissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
          <div className="text-muted small fw-500">
            Showing <b>{filteredPermissions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredPermissions.length)}</b> of <b>{filteredPermissions.length}</b> entries
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0 gap-2">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link border-0 bg-light text-muted px-3" 
                  style={{ borderRadius: 8 }}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link border-0 px-3" 
                    style={{ borderRadius: 8, backgroundColor: currentPage === i + 1 ? 'var(--accent)' : 'transparent' }}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link border-0 bg-light text-muted px-3" 
                  style={{ borderRadius: 8 }}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
