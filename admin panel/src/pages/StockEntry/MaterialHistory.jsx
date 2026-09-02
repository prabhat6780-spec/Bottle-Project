import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { fetchStockSummary, fetchMaterialHistory, deleteStockEntry, setSearchTerm } from '../../redux/slices/stockEntrySlice';
import StockOutForm from './StockOutForm';
import { Can } from '../../context/AbilityContext';
import Select from 'react-select';
import Swal from 'sweetalert2';

export default function MaterialHistory() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { summary, history, historyCurrentStock, loading, historyPage, historyTotalPages, historyTotal, searchTerm } = useSelector((state) => state.stockEntries);
  const search = searchTerm || '';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = searchParams.get("page") || '';
  const currentPage = Number(urlPage) || historyPage || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showOutForm, setShowOutForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editOutEntry, setEditOutEntry] = useState(null);

  // Ensure summary is loaded
  useEffect(() => {
    if (summary.length === 0) {
      dispatch(fetchStockSummary({ date: new Date().toISOString().split('T')[0], page: 1, limit: 1000, search: '' }));
    }
  }, [dispatch, summary.length]);

  // Handle incoming materialId from navigation state
  useEffect(() => {
    if (summary.length > 0) {
      if (location.state?.materialId) {
        const mat = location.state.materialId === 'all' 
          ? { rawMaterial: { _id: 'all', name: 'All Materials' } }
          : summary.find(m => m.rawMaterial._id === location.state.materialId);
          
        if (mat && (!selectedMaterial || mat.rawMaterial._id !== selectedMaterial.rawMaterial._id)) {
          setSelectedMaterial(mat);
        }
      } else if (!selectedMaterial) {
        setSelectedMaterial({ rawMaterial: { _id: 'all', name: 'All Materials' } });
      }
    }
    // eslint-disable-next-line
  }, [summary, location.state]);

  // Fetch paginated history when selected material, page, limit, or search changes
  useEffect(() => {
    if (selectedMaterial) {
      dispatch(fetchMaterialHistory({
        id: selectedMaterial.rawMaterial._id,
        page: currentPage,
        limit: itemsPerPage,
        search
      }));
    }
  }, [dispatch, selectedMaterial, currentPage, itemsPerPage, search]);

  const handleEditOut = (record, material) => {
    setSelectedMaterial(material);
    setEditOutEntry({
      id: record._id.split('_')[0],
      date: record.date,
      quantity: Math.abs(record.quantity)
    });
    setShowOutForm(true);
  };

  const handleDeleteInvoice = (id, invoiceNumber) => {
    Swal.fire({
      title: 'Delete Entry?',
      text: `Are you sure you want to delete "${invoiceNumber}"? This will reverse the stock changes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteStockEntry(id)).then(res => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Entry deleted successfully.', 'success');
            dispatch(fetchStockSummary({ date: new Date().toISOString().split('T')[0], page: 1, limit: 1000, search: '' }));
            if (selectedMaterial) {
              dispatch(fetchMaterialHistory({ id: selectedMaterial.rawMaterial._id, page: currentPage, limit: itemsPerPage, search }));
            }
          } else {
            Swal.fire('Error!', res.payload || 'Failed to delete.', 'error');
          }
        });
      }
    });
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      borderRadius: '8px',
      padding: '2px',
      backgroundColor: '#f8f9fa'
    }),
    indicatorSeparator: () => ({ display: 'none' }), // Removes the grey separator line
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 companies-page-header">
        <div>
          <h1 className="page-title">Material History</h1>
          <p className="page-subtitle">Track every inward and outward transaction</p>
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
                <Link to="/stock-invoices" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold text-muted">
                  <i className="bi bi-receipt-cutoff me-2"></i> Invoices
                </Link>
              </li>
            </Can>
            <Can I="ledger" a="stock_entry">
              <li className="nav-item">
                <Link to="/stock-history" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold active border-bottom border-primary border-3 text-primary">
                  <i className="bi bi-clock-history me-2"></i> Material History
                </Link>
              </li>
            </Can>
          </ul>
        </div>
        
        {/* Pagination Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-bottom bg-white companies-dash-toolbar">
          <div className="d-flex align-items-center gap-3 mb-2 mb-md-0">
            <span className="text-muted fw-bold small text-nowrap">Select Material:</span>
            <div style={{ width: 250 }}>
              <Select
                styles={customSelectStyles}
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                options={[
                  { value: 'all', label: '-- All Materials --' },
                  ...summary.map(item => ({
                    value: item.rawMaterial._id,
                    label: item.rawMaterial.name
                  }))
                ]}
                value={
                  selectedMaterial?.rawMaterial?._id === 'all'
                    ? { value: 'all', label: '-- All Materials --' }
                    : selectedMaterial?.rawMaterial
                      ? { value: selectedMaterial.rawMaterial._id, label: selectedMaterial.rawMaterial.name }
                      : null
                }
                onChange={(selectedOption) => {
                  setSearchParams({ page: 1 });
                  if (selectedOption.value === 'all') {
                    setSelectedMaterial({ rawMaterial: { _id: 'all', name: 'All Materials' } });
                  } else {
                    const mat = summary.find(m => m.rawMaterial._id === selectedOption.value);
                    if (mat) setSelectedMaterial(mat);
                  }
                }}
                placeholder="Search Material..."
              />
            </div>
            
            <div className="d-flex align-items-center gap-2 text-muted small fw-500 ms-md-4">
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
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="search-input-wrapper position-relative companies-search-wrap">
              <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
                placeholder="Search history..."
                value={search}
                onChange={e => { dispatch(setSearchTerm(e.target.value)); setSearchParams({ page: 1 }); }}
                style={{ borderRadius: 10, fontSize: 13 }}
              />
            </div>
            
            {selectedMaterial && selectedMaterial.rawMaterial._id !== 'all' && (
              <div className="fw-bold border rounded-3 px-3 py-2 bg-light text-primary d-none d-md-block">
                Current Balance: {historyCurrentStock.toFixed(2)} {history[0]?.unit || 'KG'}
              </div>
            )}
          </div>
        </div>
        
        {selectedMaterial ? (
          <div className="companies-list-desktop table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-3 text-uppercase small fw-bold text-muted ps-4">Date & Time</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Material</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center">Type</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Reference</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center">Quantity</th>
                  {selectedMaterial.rawMaterial._id !== 'all' && (
                    <th className="py-3 text-uppercase small fw-bold text-primary text-center">Balance</th>
                  )}
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">Loading...</td></tr>
                ) : history.map((record, idx) => (
                  <tr key={record._id || idx}>
                    <td className="ps-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{new Date(record.createdAt || record.date).toLocaleDateString()}</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(record.createdAt || record.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">{record.materialName}</td>
                    <td className="text-center">
                      {record.type === 'IN' 
                        ? <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill shadow-sm">IN</span>
                        : <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill shadow-sm">OUT</span>}
                    </td>
                    <td className="text-muted small">
                      {record.type === 'IN' ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light p-2 rounded text-primary">
                            <i className="bi bi-receipt"></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">{record.invoiceNumber}</span>
                            <span style={{fontSize: 11}}>{record.supplierName}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light p-2 rounded text-danger">
                            <i className="bi bi-box-arrow-up"></i>
                          </div>
                          <span className="fw-500">{record.remarks || 'Stock OUT'}</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${record.type === 'IN' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-danger bg-opacity-10 text-danger border-danger'} border border-opacity-25 px-2 py-1`}>
                        {record.type === 'IN' ? '+' : '-'}{record.quantity.toFixed(2)} {record.unit || 'KG'}
                      </span>
                    </td>
                    {selectedMaterial.rawMaterial._id !== 'all' && (
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 fs-6">
                          {record.balance.toFixed(2)} {record.unit || 'KG'}
                        </span>
                      </td>
                    )}
                    <td className="text-center pe-4">
                      <div className="companies-mobile-actions brands-mobile-actions d-flex gap-2 justify-content-center">
                        {record.type === 'IN' ? (
                          <>
                            <Can I="edit" a="stock_entry">
                              <Link to={`/stock-entries/edit/${record._id.split('_')[0]}`} state={{ from: '/stock-history', editItemId: record._id.split('_')[1] }} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit IN">
                                <i className="bi bi-pencil-square fs-6" />
                              </Link>
                            </Can>
                          </>
                        ) : (
                          <>
                            <Can I="edit" a="stock_entry">
                              <button onClick={() => {
                                const mat = selectedMaterial.rawMaterial._id === 'all' 
                                  ? summary.find(s => s.rawMaterial._id === record._id.split('_')[1])
                                  : selectedMaterial;
                                if(mat) handleEditOut(record, mat);
                              }} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit OUT">
                                <i className="bi bi-pencil-square fs-6" />
                              </button>
                            </Can>
                          </>
                        )}
                        <Can I="delete" a="stock_entry">
                          <button onClick={() => handleDeleteInvoice(record._id.split('_')[0], record.invoiceNumber || 'OUT')} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Delete">
                            <i className="bi bi-trash fs-6" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && !loading && (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No history found for this material.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">Please select a material to view history.</div>
        )}
        
        {/* Pagination Footer */}
        {historyTotal > 0 && (
          <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-top bg-white">
            <div className="text-muted small mb-2 mb-md-0">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, historyTotal)} of {historyTotal} entries
            </div>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-light border-light-subtle shadow-none"
                disabled={currentPage === 1}
                onClick={() => setSearchParams({ page: currentPage - 1 })}
              >
                Previous
              </button>
              {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((pg) => {
                if (
                  pg === 1 || 
                  pg === historyTotalPages || 
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
                disabled={currentPage === historyTotalPages}
                onClick={() => setSearchParams({ page: currentPage + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock OUT Modal */}
      {showOutForm && selectedMaterial && (
        <StockOutForm 
          onClose={() => {
            setShowOutForm(false);
            setEditOutEntry(null);
          }}
          selectedDate={new Date().toISOString().split('T')[0]}
          material={selectedMaterial}
          editEntry={editOutEntry}
        />
      )}
    </div>
  );
}
