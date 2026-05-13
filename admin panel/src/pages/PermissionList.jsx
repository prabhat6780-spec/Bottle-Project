import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions, deletePermission } from '../redux/slices/permissionSlice';
import Swal from 'sweetalert2';

export default function PermissionList() {
  const [search, setSearch] = useState('');
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

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="page-title mb-1">System Permissions</h1>
          <p className="page-subtitle mb-0">Total permissions found: {permissions.length}</p>
        </div>
        <Link to="/permissions/create" className="btn-accent shadow-sm px-4 py-2 rounded-3">
          <i className="bi bi-shield-plus me-2" /> Add Permission
        </Link>
      </div>

      <div className="dash-card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 20 }}>
        <div className="dash-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2 text-muted small fw-500">
            <span>Show</span>
            <select className="form-select form-select-sm shadow-none border-light-subtle bg-light" style={{ width: 70, borderRadius: 8, cursor: 'pointer' }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-input-wrapper position-relative" style={{ width: 320 }}>
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

        <div className="table-responsive">
          <table className="data-table mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Permission Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((permission, index) => (
                <tr key={permission._id} className="align-middle hover-bg-light transition-all border-bottom">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String(index + 1).padStart(2, '0')}</span>
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
              {filteredPermissions.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No permissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>1</b> to <b>{filteredPermissions.length}</b> of <b>{filteredPermissions.length}</b> entries
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0 gap-2">
              <li className="page-item disabled">
                <button className="page-link border-0 bg-light text-muted px-3" style={{ borderRadius: 8 }}>Previous</button>
              </li>
              <li className="page-item active">
                <button className="page-link border-0 px-3" style={{ borderRadius: 8, backgroundColor: 'var(--accent)' }}>1</button>
              </li>
              <li className="page-item disabled">
                <button className="page-link border-0 bg-light text-muted px-3" style={{ borderRadius: 8 }}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
