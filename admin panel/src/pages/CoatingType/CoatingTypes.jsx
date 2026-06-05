import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Can } from '../../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoatingTypes, deleteCoatingType } from '../../redux/slices/coatingTypeSlice';
import Swal from 'sweetalert2';

export default function CoatingTypes() {
  const dispatch = useDispatch();
  const { items, loading, totalPages, total } = useSelector((state) => state.coatingType);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCoatingTypes({ page: currentPage, limit: itemsPerPage, search }));
  }, [dispatch, currentPage, itemsPerPage, search]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Coating Type?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCoatingType(id)).then(res => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Coating Type removed.', 'success');
            dispatch(fetchCoatingTypes({ page: currentPage, limit: itemsPerPage, search }));
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
          }
        });
      }
    });
  };

  const isItemActive = (b) =>
    b.status === true || b.status === 'active' || b.status === undefined;

  const avatarColors = [
    'linear-gradient(135deg,#f97316,#ea580c)',
    'linear-gradient(135deg,#14b8a6,#0d9488)',
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#ec4899,#db2777)',
  ];

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between companies-page-header">
        <div>
          <h1 className="page-title">Coating Types</h1>
          <p className="page-subtitle">Manage coating method options</p>
        </div>
        <Can I="create" a="coating-type">
          <Link to="/coating-types/add" className="btn-accent">
            <i className="bi bi-plus-circle-fill me-2" /> Add Coating Type
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
              placeholder="Search coating types..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchParams({ page: 1 }); }}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-mobile">
          {items.map((b, index) => (
            <div key={b._id} className="companies-mobile-card">
              <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                <div
                  className="companies-mobile-avatar"
                  style={{ background: avatarColors[index % avatarColors.length] }}
                >
                  {b.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="text-muted small fw-bold">#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    <span className="fw-semibold text-truncate">{b.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className={`badge-status badge-${isItemActive(b) ? 'active' : 'inactive'}`}>
                      {isItemActive(b) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="small text-muted">
                    <i className="bi bi-calendar-event me-1"></i>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="companies-mobile-actions">
                <Can I="edit" a="coating-type">
                  <Link
                    to={`/coating-types/edit/${b._id}`}
                    className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn"
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square fs-6" />
                  </Link>
                </Can>
                <Can I="delete" a="coating-type">
                  <button
                    type="button"
                    onClick={() => handleDelete(b._id, b.name)}
                    className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn"
                    title="Delete"
                  >
                    <i className="bi bi-trash fs-6" />
                  </button>
                </Can>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div className="companies-mobile-empty">No coating types found</div>
          )}
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table mb-0">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 150 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Type Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Created At</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {items.map((b, index) => (
                <tr key={b._id} className="align-middle border-bottom transition-all hover-bg-light">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '00')}</span>
                  </td>
                  <td className="py-3 text-center fw-600">{b.name}</td>
                  <td className="py-3 text-center">
                    <span className={`badge-status badge-${isItemActive(b) ? 'active' : 'inactive'}`}>
                      {isItemActive(b) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 text-center text-muted">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Can I="edit" a="coating-type">
                        <Link to={`/coating-types/edit/${b._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="coating-type">
                        <button onClick={() => handleDelete(b._id, b.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No coating types found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
          <div className="text-muted small fw-500">
            Showing <b>{total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, total)}</b> of <b>{total}</b> entries
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => { if (currentPage > 1) setSearchParams({ page: currentPage - 1 }); }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setSearchParams({ page: p })}
              >
                {p}
              </button>
            ))}
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
