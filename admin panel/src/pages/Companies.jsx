import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, deleteCompany } from '../redux/slices/companySlice';
import Swal from 'sweetalert2';

export default function Companies() {
  const dispatch = useDispatch();
  const { companies, loading } = useSelector((state) => state.companies);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const handledeleteCompany = (id, name) => {
    Swal.fire({
      title: 'Delete company?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCompany(id)).then(res => {
          if (!res.error) Swal.fire('Deleted!', 'company removed.', 'success');
          else Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
        });
      }
    });
  };

  const filteredcompanies = useMemo(() => {
    return companies.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [companies, search]);

  const totalPages = Math.ceil(filteredcompanies.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredcompanies.slice(start, start + itemsPerPage);
  }, [filteredcompanies, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const isCompanyActive = (b) =>
    b.status === true || b.status === 'active' || b.status === undefined;

  const companyAvatarColors = [
    'linear-gradient(135deg,#00aeef,#008ecc)',
    'linear-gradient(135deg,#007236,#008b45)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#ffcc00,#ffb300)',
  ];

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between companies-page-header">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Manage your company portfolio</p>
        </div>
        <Can I="create" a="company">
          <Link to="/companies/add" className="btn-accent">
            <i className="bi bi-plus-circle-fill me-2" /> Add Company
          </Link>
        </Can>
      </div>

      <div className="dash-card">
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
          <div className="search-input-wrapper position-relative" style={{ width: 320 }}>
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-mobile">
          {paginatedItems.map((b, index) => (
            <div key={b._id} className="companies-mobile-card">
              <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                <div
                  className="companies-mobile-avatar"
                  style={{ background: companyAvatarColors[index % companyAvatarColors.length] }}
                >
                  {b.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-muted small fw-bold">#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    <span className="fw-semibold text-truncate">{b.name}</span>
                  </div>
                  <span className={`badge-status badge-${isCompanyActive(b) ? 'active' : 'inactive'}`}>
                    {isCompanyActive(b) ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <div className="small text-muted mt-1">
                    Created {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="companies-mobile-actions">
                <Can I="edit" a="company">
                  <Link
                    to={`/companies/edit/${b._id}`}
                    className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn"
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square fs-6" />
                  </Link>
                </Can>
                <Can I="delete" a="company">
                  <button
                    type="button"
                    onClick={() => handledeleteCompany(b._id, b.name)}
                    className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn"
                    title="Delete"
                  >
                    <i className="bi bi-trash fs-6" />
                  </button>
                </Can>
              </div>
            </div>
          ))}
          {paginatedItems.length === 0 && !loading && (
            <div className="companies-mobile-empty">No companies found</div>
          )}
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table mb-0">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Company Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Created At</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {paginatedItems.map((b, index) => (
                <tr key={b._id} className="align-middle border-bottom transition-all hover-bg-light">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center fw-600">{b.name}</td>
                  <td className="py-3 text-center">
                    <span className={`badge-status badge-${isCompanyActive(b) ? 'active' : 'inactive'}`}>
                      {isCompanyActive(b) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 text-center text-muted">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Can I="edit" a="company">
                        <Link to={`/companies/edit/${b._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="company">
                        <button onClick={() => handledeleteCompany(b._id, b.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && !loading && (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
          <div className="text-muted small fw-500">
            Showing <b>{filteredcompanies.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredcompanies.length)}</b> of <b>{filteredcompanies.length}</b> entries
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
