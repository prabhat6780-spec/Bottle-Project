import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchStockInvoices, deleteStockEntry, setSearchTerm } from '../../redux/slices/stockEntrySlice';
import Swal from 'sweetalert2';
import { Can } from '../../context/AbilityContext';
import { V_URL } from '../../../Baseurl.js';

export default function StockInvoices() {
  const dispatch = useDispatch();
  
  const { invoices, loading, invoicesPage, invoicesTotalPages, invoicesTotal, searchTerm } = useSelector((state) => state.stockEntries);
  const search = searchTerm || '';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = searchParams.get("page") || '';
  const currentPage = Number(urlPage) || invoicesPage || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchStockInvoices({ page: currentPage, limit: itemsPerPage, search }));
  }, [dispatch, currentPage, itemsPerPage, search]);

  const handleDeleteInvoice = (id, invoiceNumber) => {
    Swal.fire({
      title: 'Delete Invoice?',
      text: `Are you sure you want to delete invoice "${invoiceNumber}"? This will reverse the stock entry.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteStockEntry(id)).then(res => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Invoice deleted successfully.', 'success');
            dispatch(fetchStockInvoices({ page: currentPage, limit: itemsPerPage, search }));
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 companies-page-header">
        <div>
          <h1 className="page-title">Stock Invoices</h1>
          <p className="page-subtitle">Track and manage all raw material inward invoices</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Can I="create" a="stock_entry">
            <Link to="/stock-entries/add" className="btn-accent companies-header-action d-flex align-items-center text-nowrap">
              <i className="bi bi-plus-lg me-2"></i> New Stock IN
            </Link>
          </Can>
        </div>
      </div>

      <div className="dash-card p-0">
        <div className="dash-card-header d-flex align-items-center justify-content-between px-4 pt-3 border-bottom bg-white companies-dash-toolbar">
          <ul className="nav nav-tabs border-0 gap-4" style={{ marginBottom: '-1px' }}>
            <Can I="read" a="stock_entry">
              <li className="nav-item">
                <Link to="/stock-summary" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold text-muted">
                  <i className="bi bi-box-seam me-2"></i> Stock Summary
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/stock-invoices" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold active border-bottom border-primary border-3 text-primary">
                  <i className="bi bi-receipt-cutoff me-2"></i> Invoices
                </Link>
              </li>
            </Can>
            <Can I="ledger" a="stock_entry">
              <li className="nav-item">
                <Link to="/stock-history" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold text-muted">
                  <i className="bi bi-clock-history me-2"></i> Material History
                </Link>
              </li>
            </Can>
          </ul>
        </div>

        {/* Pagination Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2 text-muted small fw-500 mb-2 mb-md-0">
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
              placeholder="Search invoices..."
              value={search}
              onChange={e => { dispatch(setSearchTerm(e.target.value)); setSearchParams({ page: 1 }); }}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-desktop table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-4">Invoice Date</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Invoice No.</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Supplier Name</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Total Items</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Time and Date of Entry</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">Loading...</td></tr>
              ) : invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td className="ps-4 fw-bold text-dark">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="fw-bold text-primary">{invoice.invoiceNumber}</td>
                  <td>{invoice.supplierName}</td>
                  <td className="text-center fw-500">
                    <span className="badge bg-light text-dark border px-2 py-1">{invoice.items.length} items</span>
                  </td>
                  <td className="text-muted small">
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(invoice.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  </td>
                  <td className="text-center pe-4">
                    <div className="companies-mobile-actions brands-mobile-actions d-flex gap-2 justify-content-center">
                      {invoice.invoiceFileUrl && (
                        <a href={`${V_URL}${invoice.invoiceFileUrl}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View File">
                          <i className="bi bi-file-earmark-pdf fs-6" />
                        </a>
                      )}
                      <Link to={`/stock-entries/view/${invoice._id}`} state={{ from: '/stock-invoices' }} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View Details">
                        <i className="bi bi-eye fs-6" />
                      </Link>
                      <Can I="edit" a="stock_entry">
                        <Link to={`/stock-entries/edit/${invoice._id}`} state={{ from: '/stock-invoices' }} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit">
                          <i className="bi bi-pencil-square fs-6" />
                        </Link>
                      </Can>
                      <Can I="delete" a="stock_entry">
                        <button type="button" onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && !loading && (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {invoicesTotal > 0 && (
          <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-top bg-white">
            <div className="text-muted small mb-2 mb-md-0">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, invoicesTotal)} of {invoicesTotal} entries
            </div>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-light border-light-subtle shadow-none"
                disabled={currentPage === 1}
                onClick={() => setSearchParams({ page: currentPage - 1 })}
              >
                Previous
              </button>
              {Array.from({ length: invoicesTotalPages }, (_, i) => i + 1).map((pg) => {
                if (
                  pg === 1 || 
                  pg === invoicesTotalPages || 
                  (pg >= currentPage - 1 && pg <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pg}
                      className={`btn btn-sm shadow-none ${currentPage === pg ? 'btn-primary' : 'btn-light border-light-subtle'}`}
                      onClick={() => setSearchParams({ page: pg })}
                    >
                      {pg}
                    </button>
                  );
                }
                if (pg === currentPage - 2 || pg === currentPage + 2) {
                  return <span key={pg} className="px-2 py-1 text-muted">...</span>;
                }
                return null;
              })}
              <button
                className="btn btn-sm btn-light border-light-subtle shadow-none"
                disabled={currentPage === invoicesTotalPages}
                onClick={() => setSearchParams({ page: currentPage + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
