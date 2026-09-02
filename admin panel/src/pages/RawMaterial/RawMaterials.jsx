import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {fetchRawMaterials, deleteRawMaterial, setSearchTerm} from '../../redux/slices/rawMaterialSlice';
import Swal from 'sweetalert2';
import { Can } from '../../context/AbilityContext';

export default function RawMaterials() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = searchParams.get('page') || '';
  const { items: rawMaterials, loading, total, totalPages, page, searchTerm } = useSelector((state) => state.rawMaterials);
  const currentPage = parseInt(urlPage || page || '1');
  const itemsPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchRawMaterials({ page: urlPage, limit: itemsPerPage, search: searchTerm }));
  }, [dispatch, urlPage, searchTerm]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete raw material "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteRawMaterial(id)).then((res) => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Raw Material has been deleted.', 'success');
            dispatch(fetchRawMaterials({ page: currentPage, limit: itemsPerPage, search: searchTerm }));
          } else {
            Swal.fire('Error', res.payload || 'Failed to delete raw material', 'error');
          }
        });
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage });
    }
  };

  // Removed local filtering, server now handles search
  const filteredMaterials = rawMaterials;

  return (
    <div className="page-content">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-subtitle">Manage system raw materials</p>
        </div>
        <Can I="create" a="raw-material">
          <Link to="/raw-materials/add" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg" />
            <span>Add Raw Material</span>
          </Link>
        </Can>
      </div>

      <div className="dash-card">
        <div className="dash-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 border-bottom pb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Show</span>
            <select className="form-select form-select-sm" style={{ width: '70px' }} disabled>
              <option>10</option>
            </select>
            <span className="text-muted small">entries</span>
          </div>

          <div className="search-box position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              className="form-control form-control-sm ps-5 bg-light border-0"
              placeholder="Search raw materials..."
              value={searchTerm}
              onChange={(e) => {
                dispatch(setSearchTerm(e.target.value));
                setSearchParams({ page: 1 });
              }}
              style={{ width: '250px' }}
            />
          </div>
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 100 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rawMaterials.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMaterials.length > 0 ? (
                filteredMaterials.map((m, index) => (
                  <tr key={m._id} className="align-middle border-bottom transition-all hover-bg-light">
                    <td className="py-3 ps-5 text-start">
                      <span className="text-muted fw-bold" style={{ fontSize: 13 }}>
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {m.name || 'N/A'}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`badge-status badge-${m.status ? 'active' : 'inactive'}`}>
                        {m.status ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <Link to={`/raw-materials/view/${m._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none p-2" title="View">
                          <i className="bi bi-eye fs-6" />
                        </Link>
                        <Can I="edit" a="raw-material">
                          <Link to={`/raw-materials/edit/${m._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                            <i className="bi bi-pencil-square fs-6" />
                          </Link>
                        </Can>
                        <Can I="delete" a="raw-material">
                          <button type="button" onClick={() => handleDelete(m._id, m.name)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                            <i className="bi bi-trash fs-6" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <i className="bi bi-inbox fs-2 text-light-subtle"></i>
                      <span>No raw materials found</span>
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
              onClick={() => { if (currentPage > 1) handlePageChange(currentPage - 1); }}
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
                  : <button key={p} className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-light'}`} onClick={() => handlePageChange(p)}>{p}</button>
              );
            })()}

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => { if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
