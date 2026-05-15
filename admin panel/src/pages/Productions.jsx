import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../context/AbilityContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductions, deleteProduction } from '../redux/slices/productionSlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../redux/slices/bottleSpecSlice';
import { fetchCompanies } from '../redux/slices/companySlice';
import { fetchVariants } from '../redux/slices/variantSlice';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function Productions() {
  const dispatch = useDispatch();
  const { productions, loading } = useSelector((state) => state.productions);
  const { brands } = useSelector((state) => state.brands);
  const { companies } = useSelector((state) => state.companies);
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const { variants } = useSelector((state) => state.variants);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchProductions());
    dispatch(fetchBrands());
    dispatch(fetchBottleSpecs());
    dispatch(fetchCompanies());
    dispatch(fetchVariants());
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
      const companyName = p.brandId?.companyId?.name || p.bottleSpecId?.brandId?.companyId?.name || '';
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
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        variantName.toLowerCase().includes(search.toLowerCase()) ||
        productName.toLowerCase().includes(search.toLowerCase()) ||
        specName.toLowerCase().includes(search.toLowerCase())
      );

      const matchesDate = (!start || prodDate >= start) &&
        (!end || prodDate <= end);

      const matchesCompany = !selectedCompany || 
        p.brandId?.companyId?._id === selectedCompany || 
        p.brandId?.companyId === selectedCompany;

      const matchesBrand = !selectedBrand ||
        p.brandId?._id === selectedBrand ||
        p.bottleSpecId?.brandId?._id === selectedBrand;

      const matchesSpec = !selectedSpec || p.bottleSpecId?._id === selectedSpec;

      const matchesVariant = !selectedVariant || p.variantId?._id === selectedVariant;

      return matchesSearch && matchesDate && matchesCompany && matchesBrand && matchesSpec && matchesVariant;
    });
  }, [productions, search, startDate, endDate, selectedCompany, selectedBrand, selectedSpec, selectedVariant]);

  const handleExport = () => {
    if (filteredProductions.length === 0) {
      Swal.fire('No Data', 'There is no data to export for the selected filters.', 'info');
      return;
    }

    const data = filteredProductions.map((p, index) => ({
      'Sr No': index + 1,
      'Date': new Date(p.date).toLocaleDateString(),
      'Company': p.brandId?.companyId?.name || 'N/A',
      'Brand': p.brandId?.name || 'N/A',
      'Bottle Name': p.bottleSpecId?.bottleName || 'N/A',
      'Bottle Code': p.bottleSpecId?.code || 'N/A',
      'Printing Type': p.bottleSpecId?.printingTypeId?.name || 'N/A',
      'Printing Color': p.bottleSpecId?.printingColorId?.name || 'N/A',
      'Product Name': p.variantId?.productName || 'N/A',
      'Variant Name': p.variantId?.variantName || 'N/A',
      'Variant Size': p.variantId?.variantSize || 'N/A',
      'Total Printed Bottles': p.totalPrinted,
      'Bottles Per Box': p.bottlePerBox,
      'Printed Remaining Bottles': p.remainingBottles
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Printing Production Report");

    // Generate filename based on dates
    let filename = "Printing_Production_Report";
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
  }, [search, itemsPerPage, startDate, endDate, selectedCompany, selectedBrand, selectedSpec, selectedVariant]);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Printing Production Logs</h1>
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
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-1">Company</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedCompany}
                onChange={(e) => { 
                  setSelectedCompany(e.target.value); 
                  setSelectedBrand(''); 
                  setSelectedSpec(''); 
                  setSelectedVariant(''); 
                }}
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-1">Brand</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedBrand}
                onChange={(e) => { 
                  setSelectedBrand(e.target.value); 
                  setSelectedSpec(''); 
                  setSelectedVariant(''); 
                }}
              >
                <option value="">All Brands</option>
                {brands
                  .filter(b => !selectedCompany || b.companyId?._id === selectedCompany || b.companyId === selectedCompany)
                  .map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))
                }
              </select>
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-1">Bottle Spec</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedSpec}
                onChange={(e) => {
                  setSelectedSpec(e.target.value);
                  setSelectedVariant('');
                }}
              >
                <option value="">All Specs</option>
                {bottleSpecs
                  .filter(s => (!selectedBrand || s.brandId?._id === selectedBrand) && (!selectedCompany || s.brandId?.companyId?._id === selectedCompany || s.brandId?.companyId === selectedCompany))
                  .map(s => (
                    <option key={s._id} value={s._id}>{s.bottleName} ({s.code})</option>
                  ))
                }
              </select>
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-1">Variant</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none py-2"
                style={{ borderRadius: 10 }}
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="">All Variants</option>
                {variants
                  .filter(v => (!selectedSpec || v.bottleSpecId?._id === selectedSpec) && (!selectedBrand || v.bottleSpecId?.brandId?._id === selectedBrand))
                  .map(v => (
                    <option key={v._id} value={v._id}>{v.variantName} ({v.productName})</option>
                  ))
                }
              </select>
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-1">Search</label>
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
            <div className="col-md-2 d-flex align-items-end">
              <button
                onClick={() => {
                  setSearch('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedCompany('');
                  setSelectedBrand('');
                  setSelectedSpec('');
                  setSelectedVariant('');
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
