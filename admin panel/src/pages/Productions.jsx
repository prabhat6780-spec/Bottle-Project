import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductions, deleteProduction } from '../redux/slices/productionSlice';
import Swal from 'sweetalert2';

export default function Productions() {
  const dispatch = useDispatch();
  const { productions, loading } = useSelector((state) => state.productions);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProductions());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Production Log?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduction(id)).then(res => {
          if (!res.error) Swal.fire('Deleted!', 'Production log removed.', 'success');
          else Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
        });
      }
    });
  };

  const filteredProductions = productions.filter(p => {
    const brandName = p.brandId?.name || '';
    const variantName = p.variantId?.variantName || '';
    const productName = p.variantId?.productName || '';
    const specName = p.bottleSpecId?.bottleName || '';

    return (
      brandName.toLowerCase().includes(search.toLowerCase()) ||
      variantName.toLowerCase().includes(search.toLowerCase()) ||
      productName.toLowerCase().includes(search.toLowerCase()) ||
      specName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Production Logs</h1>
          <p className="page-subtitle">Track and manage daily production entries</p>
        </div>
        <div className="d-flex gap-2">
          <Can I="create" a="production">
            <Link to="/productions/add" className="btn-accent">
              <i className="bi bi-plus-lg me-2" /> Add Production
            </Link>
          </Can>
        </div>
      </div>

      <div className="dash-card">
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
              placeholder="Search production logs..."
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
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 120 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Date</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Brand</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Product & Variant</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Qty / Boxes</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductions.map((p, index) => (
                <tr key={p._id} className="align-middle border-bottom transition-all hover-bg-light">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String(index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-dark">{new Date(p.date).toLocaleDateString()}</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-accent" style={{ fontSize: 13 }}>{p.brandId?.name || 'N/A'}</div>
                    <div className="small text-muted">{p.bottleSpecId?.bottleName}</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-dark">{p.variantId?.productName}</div>
                    <div className="small text-muted">{p.variantId?.variantName} ({p.variantId?.variantSize})</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex flex-column align-items-center gap-1">
                      <div className="fw-bold text-dark">{p.totalPrinted} <small className="text-muted fw-normal">pcs</small></div>
                      <span className="badge bg-soft-primary text-primary rounded-pill px-3 py-1" style={{ fontSize: 12 }}>
                        {p.totalBoxes} <small className="fw-normal">Boxes</small>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Can I="edit" a="production">
                        <Link to={`/productions/edit/${p._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="production">
                        <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProductions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">No production logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>1</b> to <b>{filteredProductions.length}</b> of <b>{filteredProductions.length}</b> entries
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
