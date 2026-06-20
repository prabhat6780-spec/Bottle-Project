import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoatingSpecs, deleteCoatingSpec } from '../../redux/slices/coatingSpecSlice';
import { Can } from '../../context/AbilityContext';
import Swal from 'sweetalert2';
import { V_URL } from '../../../Baseurl.js';

export default function CoatingSpecs() {
  const dispatch = useDispatch();
  const { coatingSpecs: specs, loading, total, totalPages } = useSelector((state) => state.coatingSpecs);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCoatingSpecs({
      page: currentPage,
      limit: itemsPerPage,
      search,
    }));
  }, [dispatch, currentPage, itemsPerPage, search]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Specification?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCoatingSpec(id)).then(res => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Specification removed.', 'success');
            dispatch(fetchCoatingSpecs({ page: currentPage, limit: itemsPerPage, search }));
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
          }
        });
      }
    });
  };

  const isItemActive = (s) =>
    s.status === true || s.status === 'active' || s.status === undefined;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between mb-4 companies-page-header">
        <div>
          <h1 className="page-title mb-1">Coating Specifications</h1>
          <p className="page-subtitle mb-0">Manage coating designs and requirements</p>
        </div>
        <Can I="create" a="coatingspec">
          <Link to="/coating-specs/add" className="btn-accent shadow-sm px-4 py-2 rounded-3 companies-header-action">
            <i className="bi bi-plus-lg me-2" /> New Specification
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
              placeholder="Search specifications..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchParams({ page: 1 }); }}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-mobile">
          {specs.map((s, index) => (
            <div key={s._id} className="companies-mobile-card brands-mobile-card">
              <div className="d-flex align-items-start gap-3 w-100 min-w-0">
                {s.image ? (
                  <img src={`${V_URL}${s.image}`} alt={s.bottleName} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-image text-muted fs-5" />
                  </div>
                )}
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="text-muted small fw-bold">#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    <span className="fw-semibold text-truncate">{s.bottleName}</span>
                    <span className="badge bg-light text-dark border fw-normal small">{s.code || 'N/A'}</span>
                  </div>
                  <div className="small text-muted">{s.brandId?.companyId?.name || 'N/A'} · {s.brandId?.name || 'N/A'}</div>
                  <div className="small text-muted mt-1">
                    {s.coatingTypeId?.name || 'N/A'}
                    {s.coatingShade ? ` — ${s.coatingShade}` : ''}
                  </div>
                  {s.variantId && (
                    <div className="d-flex align-items-center gap-2 mt-1">
                      {s.variantId.image && (
                        <img src={`${V_URL}${s.variantId.image}`} alt={s.variantId.variantName} style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                      )}
                      <span className="badge bg-light text-primary border" style={{ fontSize: 10 }}>{s.variantId.variantName} - {s.variantId.variantSize}</span>
                    </div>
                  )}
                  <span className={`badge-status badge-${isItemActive(s) ? 'active' : 'inactive'} mt-1 d-inline-block`}>
                    {isItemActive(s) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="companies-mobile-actions brands-mobile-actions">
                <Can I="read" a="coatingspecdetail">
                  <Link to={`/coating-specs/view/${s._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View">
                    <i className="bi bi-eye fs-6" />
                  </Link>
                </Can>
                <Can I="edit" a="coatingspec">
                  <Link to={`/coating-specs/edit/${s._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit">
                    <i className="bi bi-pencil-square fs-6" />
                  </Link>
                </Can>
                <Can I="delete" a="coatingspec">
                  <button type="button" onClick={() => handleDelete(s._id, s.bottleName)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Delete">
                    <i className="bi bi-trash fs-6" />
                  </button>
                </Can>
              </div>
            </div>
          ))}
          {specs.length === 0 && !loading && (
            <div className="companies-mobile-empty">No specifications found</div>
          )}
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 80 }}>Image</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Bottle Name & Code</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Company</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Associated Brand</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Coating Details</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Variant</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {specs.map((s, index) => (
                <tr key={s._id} className="align-middle transition-all hover-bg-light border-bottom">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center">
                    {s.image ? (
                      <img src={`${V_URL}${s.image}`} alt={s.bottleName} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <i className="bi bi-image text-muted fs-5" />
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{s.bottleName}</div>
                        <div className="text-muted small mt-1">
                          <span className="badge bg-light text-dark border fw-normal" style={{ fontSize: 11, borderRadius: 6 }}>{s.code || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="fw-600 text-dark" style={{ fontSize: 13 }}>
                      {s.brandId?.companyId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#fff0f3', color: '#e91e63', fontWeight: 600, fontSize: 12 }}>
                      {s.brandId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex flex-column align-items-center">
                      <div className="fw-600 text-dark" style={{ fontSize: 13 }}>{s.coatingTypeId?.name || 'N/A'}</div>
                      {s.coatingShade && (
                        <div className="text-muted small badge bg-light text-primary border" style={{ fontSize: 11, marginTop: 4 }}>
                          {s.coatingShade}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {s.variantId ? (
                      <div className="d-flex flex-column align-items-center gap-1">
                        {s.variantId.image && (
                          <img src={`${V_URL}${s.variantId.image}`} alt={s.variantId.variantName} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                        )}
                        <div className="fw-600 text-dark" style={{ fontSize: 12 }}>{s.variantId.variantName}</div>
                        <div className="text-muted small" style={{ fontSize: 11 }}>{s.variantId.variantSize}</div>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`badge-status rounded-pill px-3 py-1 text-uppercase fw-bold`}
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.5px',
                        backgroundColor: isItemActive(s) ? '#e6fffa' : '#fff5f5',
                        color: isItemActive(s) ? '#38a169' : '#e53e3e',
                        border: `1px solid ${isItemActive(s) ? '#b2f5ea' : '#fed7d7'}`
                      }}
                    >
                      {isItemActive(s) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Can I="read" a="coatingspecdetail">
                        <Link to={`/coating-specs/view/${s._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none p-2" title="View">
                          <i className="bi bi-eye fs-6" />
                        </Link>
                      </Can>
                      <Can I="edit" a="coatingspec">
                        <Link to={`/coating-specs/edit/${s._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="coatingspec">
                        <button onClick={() => handleDelete(s._id, s.bottleName)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {specs.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="py-4">
                      <i className="bi bi-search text-muted mb-3 d-block" style={{ fontSize: 48 }} />
                      <h5 className="text-dark fw-bold">No results found</h5>
                      <p className="text-muted">Try adjusting your search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
