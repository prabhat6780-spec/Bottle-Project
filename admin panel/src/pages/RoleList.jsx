import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, deleteRole } from '../redux/slices/roleSlice';
import { Can } from '../context/AbilityContext';
import Swal from 'sweetalert2';

export default function RoleList() {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => state.roles);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Role?',
      text: `Are you sure you want to delete the "${name}" role?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      borderRadius: 15
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteRole(id)).then((res) => {
          if (!res.error) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Role has been removed.',
              icon: 'success',
              borderRadius: 15
            });
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete role', 'error');
          }
        });
      }
    });
  };
  const filteredRoles = useMemo(() => {
    return roles.filter(role => role.name.toLowerCase().includes(search.toLowerCase()));
  }, [roles, search]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="page-title mb-1">Role Management</h1>
        </div>
          <Can I="create" a="role">
            <Link to="/roles/create" className="btn-accent shadow-sm px-4 py-2 rounded-3">
              <i className="bi bi-plus-lg me-2" /> Add Role
            </Link>
          </Can>
      </div>

      <div className="dash-card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 20 }}>
        <div className="dash-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
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
          <div className="search-input-wrapper position-relative" style={{ width: 320 }}>
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
              placeholder="Search roles..."
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
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Role Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                    Loading roles...
                  </td>
                </tr>
              ) : (
                paginatedItems.map((role, index) => (
                  <tr key={role._id} className="align-middle hover-bg-light transition-all border-bottom">
                    <td className="py-3 ps-5 text-start">
                      <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="fw-bold text-dark">{role.name}</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <Can I="edit" a="role">
                          <Link to={`/roles/edit/${role._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit Role">
                            <i className="bi bi-pencil-square fs-6" />
                          </Link>
                        </Can>
                        <Can I="delete" a="role">
                          <button onClick={() => handleDelete(role._id, role.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete Role">
                            <i className="bi bi-trash fs-6" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && paginatedItems.length === 0 && (
                <tr><td colSpan={3} className="text-center py-5 text-muted">No roles found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>{filteredRoles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredRoles.length)}</b> of <b>{filteredRoles.length}</b> entries
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
