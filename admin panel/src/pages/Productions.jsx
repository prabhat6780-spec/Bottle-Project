import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductions, deleteProduction } from '../redux/slices/productionSlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../redux/slices/bottleSpecSlice';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function Productions() {
  const dispatch = useDispatch();
  const { productions, loading } = useSelector((state) => state.productions);
  const { brands } = useSelector((state) => state.brands);
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchProductions());
    dispatch(fetchBrands());
    dispatch(fetchBottleSpecs());
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

  const filteredProductions = useMemo(() => {
    return productions.filter(p => {
      const brandName = p.brandId?.name || p.bottleSpecId?.brandId?.name || '';
      const variantName = p.variantId?.variantName || '';
      const productName = p.variantId?.productName || '';
      const specName = p.bottleSpecId?.bottleName || '';
      const prodDate = new Date(p.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // Normalize start date to beginning of day
      if (start) start.setHours(0, 0, 0, 0);
      // Normalize end date to end of day
      if (end) end.setHours(23, 59, 59, 999);

      const matchesSearch = (
        brandName.toLowerCase().includes(search.toLowerCase()) ||
        variantName.toLowerCase().includes(search.toLowerCase()) ||
        productName.toLowerCase().includes(search.toLowerCase()) ||
        specName.toLowerCase().includes(search.toLowerCase())
      );

      const matchesDate = (!start || prodDate >= start) &&
                          (!end || prodDate <= end);

      const matchesBrand = !selectedBrand || 
                           p.brandId?._id === selectedBrand || 
                           p.bottleSpecId?.brandId?._id === selectedBrand;
      
      const matchesSpec = !selectedSpec || p.bottleSpecId?._id === selectedSpec;

      return matchesSearch && matchesDate && matchesBrand && matchesSpec;
    });
  }, [productions, search, startDate, endDate, selectedBrand, selectedSpec]);

  const handleExport = () => {
    if (filteredProductions.length === 0) {
      Swal.fire('No Data', 'There is no data to export for the selected filters.', 'info');
      return;
    }

    const data = filteredProductions.map((p, index) => ({
      'Sr No': index + 1,
      'Date': new Date(p.date).toLocaleDateString(),
      'Brand': p.brandId?.name || p.bottleSpecId?.brandId?.name || 'Deleted Brand',
      'Bottle Name': p.bottleSpecId?.bottleName || 'N/A',
      'Printing Type': p.bottleSpecId?.printingTypeId?.name || 'N/A',
      'Printing Color': p.bottleSpecId?.printingColorId?.name || 'No Color',
      'Product Name': p.variantId?.productName || 'N/A',
      'Variant': p.variantId?.variantName || 'N/A',
      'Size': p.variantId?.variantSize || 'N/A',
      'Total Printed (pcs)': p.totalPrinted,
      'Total Boxes': p.totalBoxes
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");
    
    // Generate filename based on dates
    let filename = "Production_Report";
    if (startDate) filename += `_from_${startDate}`;
    if (endDate) filename += `_to_${endDate}`;
    filename += ".xlsx";

    XLSX.writeFile(workbook, filename);
  };

  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProductions.slice(start, start + itemsPerPage);
  }, [filteredProductions, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, startDate, endDate, selectedBrand, selectedSpec]);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Production Logs</h1>
          <p className="page-subtitle">Track and manage daily production entries</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm border">
            <label className="small text-muted fw-bold mb-0">From:</label>
            <input 
              type="date" 
              className="form-control form-control-sm border-0 shadow-none p-0" 
              style={{ width: 120 }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm border">
            <label className="small text-muted fw-bold mb-0">To:</label>
            <input 
              type="date" 
              className="form-control form-control-sm border-0 shadow-none p-0" 
              style={{ width: 120 }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={handleExport} className="btn btn-outline-success shadow-sm px-4 py-2 rounded-3">
            <i className="bi bi-file-earmark-excel-fill me-2" /> Export Excel
          </button>
          <Can I="create" a="production">
            <Link to="/productions/add" className="btn-accent shadow-sm px-4 py-2 rounded-3">
              <i className="bi bi-plus-lg me-2" /> New Entry
            </Link>
          </Can>
        </div>
      </div>

      <div className="dash-card border-0 shadow-sm mb-4" style={{ borderRadius: 20 }}>
        <div className="dash-card-body p-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="small text-muted fw-bold mb-1">Filter by Brand</label>
              <select 
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedBrand}
                onChange={(e) => { setSelectedBrand(e.target.value); setSelectedSpec(''); }}
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="small text-muted fw-bold mb-1">Filter by Bottle Spec</label>
              <select 
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                <option value="">All Specifications</option>
                {bottleSpecs
                  .filter(s => !selectedBrand || s.brandId?._id === selectedBrand)
                  .map(s => (
                    <option key={s._id} value={s._id}>{s.bottleName} ({s.code})</option>
                  ))
                }
              </select>
            </div>
            <div className="col-md-3">
              <label className="small text-muted fw-bold mb-1">Search Anything</label>
              <div className="search-input-wrapper position-relative">
                <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="form-control form-control-sm border-light-subtle bg-light ps-5 py-2 shadow-none"
                  placeholder="Search logs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ borderRadius: 10 }}
                />
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
               <button 
                onClick={() => {
                  setSearch('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedBrand('');
                  setSelectedSpec('');
                }}
                className="btn btn-sm btn-light border-light-subtle w-100 py-2"
                style={{ borderRadius: 10, fontWeight: 600 }}
               >
                Reset Filters
               </button>
            </div>
          </div>
        </div>
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
              {paginatedItems.map((p, index) => (
                <tr key={p._id} className="align-middle border-bottom transition-all hover-bg-light">
                  <td className="py-3 ps-5 text-start">
                    <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-dark">{new Date(p.date).toLocaleDateString()}</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="fw-600 text-accent" style={{ fontSize: 13 }}>
                      {p.brandId?.name || p.bottleSpecId?.brandId?.name || 'Deleted Brand'}
                    </div>
                    <div className="fw-500 text-dark small">{p.bottleSpecId?.bottleName}</div>
                    <div className="small text-muted" style={{ fontSize: 11 }}>
                      {p.bottleSpecId?.printingTypeId?.name || 'N/A'} — {p.bottleSpecId?.printingColorId?.name || 'No Color'}
                    </div>
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
              {paginatedItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">No production logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white">
          <div className="text-muted small fw-500">
            Showing <b>{filteredProductions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredProductions.length)}</b> of <b>{filteredProductions.length}</b> entries
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
