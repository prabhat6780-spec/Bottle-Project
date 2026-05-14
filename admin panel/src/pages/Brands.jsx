import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, deleteBrand } from '../redux/slices/brandSlice';
import Swal from 'sweetalert2';

export default function Brands() {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleDeleteBrand = (id, name) => {
    Swal.fire({
      title: 'Delete Brand?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteBrand(id)).then(res => {
          if (!res.error) Swal.fire('Deleted!', 'Brand removed.', 'success');
          else Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
        });
      }
    });
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
  }, [brands, search]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Brands</h1>
          <p className="page-subtitle">Manage your brand portfolio</p>
        </div>
        <Can I="create" a="brand">
          <Link to="/brands/add" className="btn-accent">
            <i className="bi bi-plus-circle-fill me-2" /> Add Brand
          </Link>
        </Can>
      </div>

      <div className="dash-card">
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
              placeholder="Search brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table mb-0">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Brand Name</th>
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
                    <span className={`badge-status badge-${(b.status === true || b.status === 'active' || b.status === undefined) ? 'active' : 'inactive'}`}>
                      {(b.status === true || b.status === 'active' || b.status === undefined) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 text-center text-muted">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Can I="edit" a="brand">
                        <Link to={`/brands/edit/${b._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="brand">
                        <button onClick={() => handleDeleteBrand(b._id, b.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && !loading && (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No brands found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>{filteredBrands.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredBrands.length)}</b> of <b>{filteredBrands.length}</b> entries
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
