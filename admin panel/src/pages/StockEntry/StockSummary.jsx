import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStockSummary, setSearchTerm } from '../../redux/slices/stockEntrySlice';
import StockOutForm from './StockOutForm';
import html2pdf from 'html2pdf.js';
import { Can } from '../../context/AbilityContext';

export default function StockSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  
  const { summary, loading, searchTerm } = useSelector((state) => state.stockEntries);
  const search = searchTerm || '';
  
  // Modals state
  const [showOutForm, setShowOutForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    dispatch(fetchStockSummary({
      date: selectedDate,
      page: 1,
      limit: 1000,
      search
    }));
  }, [dispatch, selectedDate, search]);

  const handleOpenOut = (material) => {
    setSelectedMaterial(material);
    setShowOutForm(true);
  };

  const handleViewHistory = (material) => {
    navigate('/stock-history', { state: { materialId: material.rawMaterial._id } });
  };

  const handlePrintSheet = () => {
    let rowsHTML = '';
    
    summary.forEach((item, index) => {
      rowsHTML += `
        <tr>
          <td style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 10px;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 10px; font-weight: bold; text-transform: uppercase; font-size: 15px;">${item.rawMaterial.name}</td>
          <td style="border: 1px solid #000; padding: 10px;"></td>
          <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 15px;">${item.currentStock.toFixed(2)} ${item.unit || 'KG'}</td>
        </tr>
      `;
    });

    const displayDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <div style="font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #000;">RAW MATERIAL PHYSICAL STOCK SHEET</div>
          <div style="font-size: 20px; font-weight: bold; color: #000;">${displayDate}</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; margin-top: 15px;">
          <thead>
            <tr>
              <th style="width: 8%; border: 1px solid #000; padding: 12px; font-weight: bold; text-align: center; font-size: 14px; background-color: #f8f9fa;">SR. NO.</th>
              <th style="width: 50%; text-align: left; border: 1px solid #000; padding: 12px; font-weight: bold; font-size: 14px; background-color: #f8f9fa;">MATERIAL NAME</th>
              <th style="width: 22%; border: 1px solid #000; padding: 12px; font-weight: bold; text-align: center; font-size: 14px; background-color: #f8f9fa;">AVL. STOCK</th>
              <th style="width: 20%; border: 1px solid #000; padding: 12px; font-weight: bold; text-align: center; font-size: 14px; background-color: #f8f9fa;">TOTAL QTY</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opt = {
      margin:       0.5,
      filename:     `Stock_Summary_${displayDate.replace(/\//g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { avoid: 'tr' }
    };

    html2pdf().set(opt).from(container).save();
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 companies-page-header">
        <div>
          <h1 className="page-title">Stock Summary</h1>
          <p className="page-subtitle">Overview of all raw material stock balances</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold text-muted mb-0 text-nowrap">Balance Date:</label>
            <input 
              type="date" 
              className="form-control shadow-none border-primary border-opacity-25" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <Can I="create" a="stock_entry">
            <Link to="/stock-entries/add" state={{ from: '/stock-summary' }} className="btn-accent companies-header-action d-flex align-items-center text-nowrap">
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
                <Link to="/stock-summary" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold active border-bottom border-primary border-3 text-primary">
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
                <Link to="/stock-history" className="nav-link bg-transparent border-0 px-0 pb-3 fw-bold text-muted">
                  <i className="bi bi-clock-history me-2"></i> Material History
                </Link>
              </li>
            </Can>
          </ul>
          <button onClick={handlePrintSheet} className="btn btn-sm btn-outline-danger d-flex align-items-center fw-bold shadow-sm bg-white mb-2">
            <i className="bi bi-file-earmark-pdf-fill me-2 fs-6"></i> Export PDF
          </button>
        </div>
        
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-end p-3 border-bottom bg-white">
          <div className="search-input-wrapper position-relative companies-search-wrap">
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
              placeholder="Search materials..."
              value={search}
              onChange={e => dispatch(setSearchTerm(e.target.value))}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="companies-list-desktop table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-4">Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted">Raw Material</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Opening</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center text-success">Stock IN</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center text-danger">Stock OUT</th>
                <th className="py-3 text-uppercase small fw-bold text-primary text-center pe-4">Current Stock</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 180 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && summary.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
              ) : summary.map((item, index) => (
                <tr key={item.rawMaterial._id}>
                  <td className="ps-4 text-muted fw-bold">{index + 1}</td>
                  <td className="fw-bold text-dark">{item.rawMaterial.name}</td>
                  <td className="text-center">
                    <span className="badge bg-light text-secondary border px-2 py-1">{item.openingStock.toFixed(2)} {item.unit}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">+{item.totalIn.toFixed(2)} {item.unit}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">-{item.totalOut.toFixed(2)} {item.unit}</span>
                  </td>
                  <td className="text-center pe-4">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 fs-6">{item.currentStock.toFixed(2)} {item.unit}</span>
                  </td>
                  <td className="text-center">
                    <div className="companies-mobile-actions brands-mobile-actions d-flex gap-2 justify-content-center">
                      <Can I="ledger" a="stock_entry">
                        <button onClick={() => handleViewHistory(item)} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View Ledger">
                          <i className="bi bi-clock-history fs-6" />
                        </button>
                      </Can>
                      <Can I="stockout" a="stock_entry">
                        <button onClick={() => handleOpenOut(item)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Stock OUT">
                          <i className="bi bi-box-arrow-up fs-6" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
              {summary.length === 0 && !loading && (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No materials found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock OUT Modal */}
      {showOutForm && selectedMaterial && (
        <StockOutForm 
          onClose={() => setShowOutForm(false)}
          selectedDate={selectedDate}
          material={selectedMaterial}
        />
      )}
    </div>
  );
}
