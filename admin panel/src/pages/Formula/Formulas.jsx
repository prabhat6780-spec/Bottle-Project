import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {fetchFormulas, deleteFormula, toggleFormulaStatus, setSearchTerm} from '../../redux/slices/formulaSlice.js';
import { Can } from '../../context/AbilityContext';
import Swal from 'sweetalert2';
import { V_URL } from '../../../Baseurl.js';

export default function Formulas() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = searchParams.get('page') || '';
  const { formulas, loading, page, totalPages, total, searchTerm } = useSelector((state) => state.formulas);
  const currentPage = Number(urlPage) || page || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const search = searchTerm || "";

  useEffect(() => {
    dispatch(fetchFormulas({
      page: urlPage,
      limit: itemsPerPage,
      search,
    }));
  }, [dispatch, urlPage, itemsPerPage, search]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Formula?',
      text: `Are you sure you want to delete this formula?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteFormula(id)).then(res => {
          if (!res.error) Swal.fire('Deleted!', 'Formula removed.', 'success');
          else Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
        });
      }
    });
  };

  const handleToggleStatus = (id) => {
    dispatch(toggleFormulaStatus(id));
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between companies-page-header">
        <div>
          <h1 className="page-title">Formulas</h1>
          <p className="page-subtitle">Manage combinations of Company, Brand, Bottle, and Variant</p>
        </div>
        <Can I="create" a="formula">
          <Link to="/formulas/add" className="btn-accent companies-header-action">
            <i className="bi bi-plus-lg me-2" /> Add Formula
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
          <div className="search-input-wrapper position-relative companies-search-wrap">
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
              placeholder="Search..."
              value={search}
              onChange={(e) => { 
                
                dispatch(setSearchTerm(e.target.value));
                setSearchParams({ page: 1 }); 
              }}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-mobile">
          {loading && formulas.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {formulas.map((f, index) => (
            <div key={f._id} className="companies-mobile-card brands-mobile-card">
              <div className="d-flex align-items-start gap-3 w-100 min-w-0">
                {f.variantId?.image ? (
                  <img src={`${V_URL}${f.variantId.image.startsWith('/') ? '' : '/'}${f.variantId.image}`} alt="Variant" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23f8f9fa%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212px%22%20fill%3D%22%236c757d%22%3ENA%3C%2Ftext%3E%3C%2Fsvg%3E'; }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-image text-muted fs-5" />
                  </div>
                )}
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="text-muted small fw-bold">#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    <span className="fw-semibold text-truncate">{f.bottleId?.bottleName || 'N/A'}</span>
                    <span className="badge bg-light text-dark border fw-normal small">{f.columns?.reduce((acc, col) => acc + (col.rawMaterials?.length || 0), 0) || 0} items</span>
                  </div>
                  <div className="small text-muted">{f.companyId?.name || 'N/A'} · <span className="text-accent">{f.brandId?.name || 'N/A'}</span></div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    <span className="badge bg-soft-info text-dark" style={{ fontSize: 10 }}>{f.variantId?.variantName || f.variantId || 'NO_DATA'}</span>
                    <span className="badge bg-light text-dark border" style={{ fontSize: 10 }}>{f.variantId?.coatingShade || 'NO_SHADE'}</span>
                    <span className="badge bg-soft-secondary text-dark" style={{ fontSize: 10 }}>{f.coatingTypeId?.name || f.coatingTypeId || 'NO_TYPE'}</span>
                  </div>
                  <span className={`badge-status badge-${f.status !== false ? 'active' : 'inactive'} mt-2 d-inline-block`}>
                    {f.status !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              <div className="companies-mobile-actions brands-mobile-actions mt-3">
                <Can I="read" a="formula">
                  <Link to={`/formulas/view/${f._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View">
                    <i className="bi bi-eye fs-6" />
                  </Link>
                </Can>
                <Can I="edit" a="formula">
                  <Link to={`/formulas/edit/${f._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit">
                    <i className="bi bi-pencil-square fs-6" />
                  </Link>
                </Can>
                <Can I="delete" a="formula">
                  <button type="button" onClick={() => handleDelete(f._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Delete">
                    <i className="bi bi-trash fs-6" />
                  </button>
                </Can>
              </div>
            </div>
          ))}
          {formulas.length === 0 && !loading && (
            <div className="companies-mobile-empty">No formulas found</div>
          )}
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 100 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 80 }}>Image</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Company</th>
                <th className="py-3 text-center fw-600 text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Brand</th>
                <th className="py-3 text-center fw-600 text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Variant</th>
                <th className="py-3 text-center fw-600 text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Bottle Names</th>
                <th className="py-3 text-center fw-600 text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Raw Materials</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 140 }}>COATING SHADE</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 140 }}>COATING TYPE</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 100 }}>Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && formulas.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : formulas.length > 0 ? (
                formulas.map((f, index) => (
                  <tr key={f._id} className="align-middle border-bottom transition-all hover-bg-light">
                    <td className="py-3 ps-5 text-start">
                      <span className="text-muted fw-bold" style={{ fontSize: 13 }}>
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {f.variantId?.image ? (
                        <img 
                          src={`${V_URL}${f.variantId.image.startsWith('/') ? '' : '/'}${f.variantId.image}`} 
                          alt="Variant" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23f8f9fa%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212px%22%20fill%3D%22%236c757d%22%3ENA%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center mx-auto" style={{ width: 40, height: 40 }}>
                          <i className="bi bi-image text-muted"></i>
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {f.companyId?.name || 'N/A'}
                    </td>
                    <td className="py-3 text-center text-accent fw-500">
                      {f.brandId?.name || 'N/A'}
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        <span className="badge bg-soft-info text-dark px-2 py-1 text-wrap" style={{ fontSize: 12, lineHeight: '1.4' }}>
                          {f.variantId?.variantName || f.variantId || 'NO_DATA'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center fw-600">
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {f.bottleId ? (
                          <span className="badge bg-light text-dark border px-2 py-1 text-wrap" style={{ fontSize: 11, lineHeight: '1.4' }}>
                            {f.bottleId.bottleName}
                          </span>
                        ) : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border px-2 py-1 fw-bold" style={{ fontSize: 11 }}>
                        {f.columns?.reduce((acc, col) => acc + (col.rawMaterials?.length || 0), 0) || 0} items
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border px-2 py-1 text-wrap" style={{ fontSize: 12, lineHeight: '1.4' }}>
                        {f.variantId?.coatingShade || 'NO_SHADE'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-soft-secondary text-dark px-2 py-1 text-wrap" style={{ fontSize: 12, lineHeight: '1.4' }}>
                        {f.coatingTypeId?.name || f.coatingTypeId || 'NO_TYPE'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`badge-status badge-${f.status !== false ? 'active' : 'inactive'}`}>
                        {f.status !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <Can I="read" a="formula">
                          <Link to={`/formulas/view/${f._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none p-2" title="View">
                            <i className="bi bi-eye fs-6" />
                          </Link>
                        </Can>
                        <Can I="edit" a="formula">
                          <Link to={`/formulas/edit/${f._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                            <i className="bi bi-pencil-square fs-6" />
                          </Link>
                        </Can>
                        <Can I="delete" a="formula">
                          <button type="button" onClick={() => handleDelete(f._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                            <i className="bi bi-trash fs-6" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <i className="bi bi-inbox fs-2 text-light-subtle"></i>
                      <span>No formulas found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
          <div className="text-muted small fw-500">
            Showing <b>{total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, total)}</b> of <b>{total}</b> entries
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => { if (currentPage > 1) setSearchParams({ page: currentPage - 1 }); }}
            >
              Previous
            </button>

            {(() => {
              const pages = [];
              const delta = 2;
              const left = currentPage - delta;
              const right = currentPage + delta;
              pages.push(1);
              if (left > 2) pages.push('...');
              for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) pages.push(i);
              if (right < totalPages - 1) pages.push('...');
              if (totalPages > 1) pages.push(totalPages);
              return pages.map((p, idx) =>
                p === '...'
                  ? <span key={`e-${idx}`} className="px-1 text-muted" style={{ fontSize: 13 }}>…</span>
                  : <button key={p} className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-light'}`} onClick={() => setSearchParams({ page: p })}>{p}</button>
              );
            })()}

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => { if (currentPage < totalPages) setSearchParams({ page: currentPage + 1 }); }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
