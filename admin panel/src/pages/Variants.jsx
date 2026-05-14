import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVariants, deleteVariant } from '../redux/slices/variantSlice';
import Swal from 'sweetalert2';

export default function Variants() {
  const dispatch = useDispatch();
  const { variants, loading } = useSelector((state) => state.variants);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchVariants());
  }, [dispatch]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Variant?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteVariant(id)).then(res => {
          if (!res.error) Swal.fire('Deleted!', 'Variant removed.', 'success');
          else Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
        });
      }
    });
  };

  const filteredVariants = useMemo(() => {
    return variants.filter(v => {
      const brandName = v.bottleSpecId?.brandId?.name || '';
      return (
        v.variantName?.toLowerCase().includes(search.toLowerCase()) ||
        v.productName?.toLowerCase().includes(search.toLowerCase()) ||
        brandName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [variants, search]);

  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVariants.slice(start, start + itemsPerPage);
  }, [filteredVariants, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Product Variants</h1>
          <p className="page-subtitle">Manage specific product versions, types, and sizes</p>
        </div>
        <Can I="create" a="variant">
          <Link to="/variants/add" className="btn-accent">
            <i className="bi bi-plus-lg me-2" /> Add Variant
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
              placeholder="Search variants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Product & Variant</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Type & Size</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Bottle Spec</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Brand</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((v, index) => (
                <tr key={v._id} className="align-middle border-bottom transition-all hover-bg-light">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-dark">{v.productName}</div>
                    <div className="small text-muted">{v.variantName}</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex flex-column gap-1 align-items-center">
                      <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: 11 }}>{v.variantType}</span>
                      <span className="badge bg-soft-primary text-primary px-2 py-1" style={{ fontSize: 11 }}>{v.variantSize}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600">{v.bottleSpecId?.bottleName || 'N/A'}</div>
                    <div className="small text-muted" style={{ fontSize: 11 }}>
                      {v.bottleSpecId?.printingTypeId?.name || 'N/A'} — {v.bottleSpecId?.printingColorId?.name || 'No Color'}
                    </div>
                  </td>
                  <td className="py-3 text-center text-accent fw-500">
                    {v.bottleSpecId?.brandId?.name || 'N/A'}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`badge-status badge-${(v.status === true || v.status === 'active' || v.status === undefined) ? 'active' : 'inactive'}`}>
                      {(v.status === true || v.status === 'active' || v.status === undefined) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Link to={`/variants/view/${v._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none p-2" title="View Details"><i className="bi bi-eye fs-6" /></Link>
                      <Can I="edit" a="variant">
                        <Link to={`/variants/edit/${v._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit"><i className="bi bi-pencil-square fs-6" /></Link>
                      </Can>
                      <Can I="delete" a="variant">
                        <button onClick={() => handleDelete(v._id, v.variantName)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete"><i className="bi bi-trash fs-6" /></button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">No variants found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>{filteredVariants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredVariants.length)}</b> of <b>{filteredVariants.length}</b> entries
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
