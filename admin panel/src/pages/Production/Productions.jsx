import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../../context/AbilityContext.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductions, deleteProduction } from '../../redux/slices/productionSlice.js';
import { fetchBrands } from '../../redux/slices/brandSlice.js';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice.js';
import { fetchCompanies } from '../../redux/slices/companySlice.js';
import { fetchVariants } from '../../redux/slices/variantSlice.js';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { V_URL } from '../../../Baseurl.js';

const parseProductionDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return new Date(dateStr);
  return new Date(y, m - 1, d);
};

const daysFromToday = (dateStr) => {
  const day = parseProductionDate(dateStr);
  if (!day) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  day.setHours(0, 0, 0, 0);
  return Math.round((today - day) / 86400000);
};

const formatProductionDate = (dateStr) => {
  const offset = daysFromToday(dateStr);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Yesterday';
  if (offset === 2) return 'Day before yesterday';
  const day = parseProductionDate(dateStr);
  return day ? day.toLocaleDateString() : 'N/A';
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const matchesDateRange = (dateStr, startIso, endIso) => {
  const prodDay = parseProductionDate(dateStr);
  if (!prodDay) return !startIso && !endIso;
  prodDay.setHours(0, 0, 0, 0);
  const start = startIso ? parseProductionDate(startIso) : null;
  const end = endIso ? parseProductionDate(endIso) : null;
  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);
  return (!start || prodDay >= start) && (!end || prodDay <= end);
};

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

  const maxFilterDate = toIsoDate(new Date());
  const minFilterDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return toIsoDate(d);
  })();

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

  const productionsByDate = useMemo(() => {
    if (!startDate && !endDate) return productions;
    return productions.filter(p => matchesDateRange(p.date, startDate, endDate));
  }, [productions, startDate, endDate]);

  const filteredCompanies = useMemo(() => {
    const ids = new Set();
    productionsByDate.forEach(p => {
      const id = p.brandId?.companyId?._id || p.brandId?.companyId ||
        p.bottleSpecId?.brandId?.companyId?._id || p.bottleSpecId?.brandId?.companyId;
      if (id) ids.add(String(id));
    });
    return companies.filter(c => ids.has(String(c._id)));
  }, [companies, productionsByDate]);

  const filteredBrands = useMemo(() => {
    const ids = new Set();
    productionsByDate.forEach(p => {
      const id = p.brandId?._id || p.brandId || p.bottleSpecId?.brandId?._id || p.bottleSpecId?.brandId;
      if (id) ids.add(String(id));
    });
    return brands.filter(b => {
      const inDateRange = ids.has(String(b._id));
      const matchesCompany = !selectedCompany ||
        b.companyId?._id === selectedCompany || b.companyId === selectedCompany;
      return inDateRange && matchesCompany;
    });
  }, [brands, productionsByDate, selectedCompany]);

  const filteredBottleSpecs = useMemo(() => {
    const ids = new Set();
    productionsByDate.forEach(p => {
      const id = p.bottleSpecId?._id || p.bottleSpecId;
      if (id) ids.add(String(id));
    });
    return bottleSpecs.filter(s => {
      const inDateRange = ids.has(String(s._id));
      const matchesBrand = !selectedBrand || s.brandId?._id === selectedBrand || s.brandId === selectedBrand;
      const matchesCompany = !selectedCompany ||
        s.brandId?.companyId?._id === selectedCompany || s.brandId?.companyId === selectedCompany;
      return inDateRange && matchesBrand && matchesCompany;
    });
  }, [bottleSpecs, productionsByDate, selectedBrand, selectedCompany]);

  const filteredVariants = useMemo(() => {
    const ids = new Set();
    productionsByDate.forEach(p => {
      const id = p.variantId?._id || p.variantId;
      if (id) ids.add(String(id));
    });
    return variants.filter(v => {
      const inDateRange = ids.has(String(v._id));
      const matchesSpec = !selectedSpec || v.bottleSpecId?._id === selectedSpec || v.bottleSpecId === selectedSpec;
      const matchesBrand = !selectedBrand || v.bottleSpecId?.brandId?._id === selectedBrand || v.bottleSpecId?.brandId === selectedBrand;
      const matchesCompany = !selectedCompany ||
        v.bottleSpecId?.brandId?.companyId?._id === selectedCompany || v.bottleSpecId?.brandId?.companyId === selectedCompany;
      return inDateRange && matchesSpec && matchesBrand && matchesCompany;
    });
  }, [variants, productionsByDate, selectedSpec, selectedBrand, selectedCompany]);

  const filteredProductions = useMemo(() => {
    return productions.filter(p => {
      const brandName = p.brandId?.name || p.bottleSpecId?.brandId?.name || '';
      const companyName = p.brandId?.companyId?.name || p.bottleSpecId?.brandId?.companyId?.name || '';
      const variantName = p.variantId?.variantName || '';
      const productName = p.variantId?.productName || '';
      const specName = p.bottleSpecId?.bottleName || '';

      const matchesSearch = (
        brandName.toLowerCase().includes(search.toLowerCase()) ||
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        variantName.toLowerCase().includes(search.toLowerCase()) ||
        productName.toLowerCase().includes(search.toLowerCase()) ||
        specName.toLowerCase().includes(search.toLowerCase())
      );

      const matchesDate = matchesDateRange(p.date, startDate, endDate);

      const matchesCompany = !selectedCompany ||
        p.brandId?.companyId?._id === selectedCompany ||
        p.brandId?.companyId === selectedCompany ||
        p.bottleSpecId?.brandId?.companyId?._id === selectedCompany ||
        p.bottleSpecId?.brandId?.companyId === selectedCompany;

      const matchesBrand = !selectedBrand ||
        p.brandId?._id === selectedBrand ||
        p.brandId === selectedBrand ||
        p.bottleSpecId?.brandId?._id === selectedBrand ||
        p.bottleSpecId?.brandId === selectedBrand;

      const matchesSpec = !selectedSpec || p.bottleSpecId?._id === selectedSpec;

      const matchesVariant = !selectedVariant || p.variantId?._id === selectedVariant;

      return matchesSearch && matchesDate && matchesCompany && matchesBrand && matchesSpec && matchesVariant;
    }).sort((a, b) => {
      const dateA = parseProductionDate(a.date)?.getTime() ?? 0;
      const dateB = parseProductionDate(b.date)?.getTime() ?? 0;
      if (dateB !== dateA) return dateB - dateA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [productions, search, startDate, endDate, selectedCompany, selectedBrand, selectedSpec, selectedVariant]);

  useEffect(() => {
    if (selectedCompany && !filteredCompanies.some(c => c._id === selectedCompany)) {
      setSelectedCompany('');
      setSelectedBrand('');
      setSelectedSpec('');
      setSelectedVariant('');
    }
  }, [filteredCompanies, selectedCompany]);

  useEffect(() => {
    if (selectedBrand && !filteredBrands.some(b => b._id === selectedBrand)) {
      setSelectedBrand('');
      setSelectedSpec('');
      setSelectedVariant('');
    }
  }, [filteredBrands, selectedBrand]);

  useEffect(() => {
    if (selectedSpec && !filteredBottleSpecs.some(s => s._id === selectedSpec)) {
      setSelectedSpec('');
      setSelectedVariant('');
    }
  }, [filteredBottleSpecs, selectedSpec]);

  useEffect(() => {
    if (selectedVariant && !filteredVariants.some(v => v._id === selectedVariant)) {
      setSelectedVariant('');
    }
  }, [filteredVariants, selectedVariant]);

  const handleExport = () => {
    if (filteredProductions.length === 0) {
      Swal.fire('No Data', 'There is no data to export for the selected filters.', 'info');
      return;
    }

    const data = filteredProductions.map((p, index) => ({
      'Sr No': index + 1,
      'Date': parseProductionDate(p.date)?.toLocaleDateString() || 'N/A',
      'Company': p.brandId?.companyId?.name || 'N/A',
      'Brand': p.brandId?.name || 'N/A',
      'Bottle Name': p.bottleSpecId?.bottleName || 'N/A',
      'Variant Name': p.variantId?.variantName || 'N/A',
      'Coating Shade': p.variantId?.coatingShade ||
        variants.find(v => v._id === (p.variantId?._id || p.variantId))?.coatingShade ||
        'N/A',
      'Text Color': p.variantId?.detectedTextColor ||
        variants.find(v => v._id === (p.variantId?._id || p.variantId))?.detectedTextColor ||
        'N/A',
      'Total Printed Bottles': p.totalPrinted,
      'Bottles Per Box': p.bottlePerBox,
      'Extra Printed Bottles': p.remainingBottles
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
      <div className="page-header d-flex align-items-center justify-content-between companies-page-header">
        <div>
          <h1 className="page-title">Printing Production</h1>
          <p className="page-subtitle">Track and manage daily production entries</p>
        </div>
        <div className="d-flex align-items-center gap-3 productions-page-actions">
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
          <div className="row g-3 align-items-end productions-filters-panel">
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">From</label>
              <input
                type="date"
                className="form-control form-control-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                min={minFilterDate}
                max={maxFilterDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">To</label>
              <input
                type="date"
                className="form-control form-control-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                min={minFilterDate}
                max={maxFilterDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">Company</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedBrand('');
                  setSelectedSpec('');
                  setSelectedVariant('');
                }}
              >
                <option value="">All Companies</option>
                {filteredCompanies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">Brand</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedSpec('');
                  setSelectedVariant('');
                }}
              >
                <option value="">All Brands</option>
                {filteredBrands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">Bottle Spec</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                value={selectedSpec}
                onChange={(e) => {
                  setSelectedSpec(e.target.value);
                  setSelectedVariant('');
                }}
              >
                <option value="">All Specs</option>
                {filteredBottleSpecs.map(s => (
                  <option key={s._id} value={s._id}>{s.bottleName} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">Variant</label>
              <select
                className="form-select form-select-sm border-light-subtle bg-light shadow-none w-100"
                style={{ borderRadius: 10, height: 38 }}
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="">All Variants</option>
                {filteredVariants.map(v => (
                  <option key={v._id} value={v._id}>{v.variantName} ({v.productName})</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <label className="small text-muted fw-bold mb-1 d-block">Search</label>
              <div className="search-input-wrapper position-relative">
                <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="form-control form-control-sm border-light-subtle bg-light ps-5 shadow-none w-100"
                  placeholder="Search logs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ borderRadius: 10, height: 38 }}
                />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedCompany('');
                  setSelectedBrand('');
                  setSelectedSpec('');
                  setSelectedVariant('');
                }}
                className="btn btn-sm btn-light border-light-subtle w-100"
                style={{ borderRadius: 10, fontWeight: 600, height: 38 }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
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
        </div>

        <div className="companies-list-mobile">
          {paginatedItems.map((p, index) => {
            const variantId = p.variantId?._id || p.variantId;
            const variantImage =
              p.variantId?.image ||
              variants.find(v => v._id === variantId)?.image;
            return (
              <div key={p._id} className="companies-mobile-card">
                <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                  {variantImage ? (
                    <img
                      src={`${V_URL}${variantImage}`}
                      alt={p.variantId?.variantName || 'Bottle'}
                      className="companies-mobile-avatar"
                      style={{ objectFit: 'cover', borderRadius: 10 }}
                    />
                  ) : (
                    <div className="companies-mobile-avatar bg-light text-muted d-flex align-items-center justify-content-center">
                      <i className="bi bi-image" />
                    </div>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span className="text-muted small fw-bold">#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                      <span className="fw-semibold">{formatProductionDate(p.date)}</span>
                    </div>
                    <div className="small text-muted">
                      {p.brandId?.companyId?.name || p.bottleSpecId?.brandId?.companyId?.name || 'N/A'} · {p.brandId?.name || p.bottleSpecId?.brandId?.name || 'N/A'}
                    </div>
                    <div className="small fw-600 text-truncate">{p.bottleSpecId?.bottleName}</div>
                    <div className="small text-muted">
                      {p.variantId?.variantName} {p.variantId?.variantSize ? `(${p.variantId.variantSize})` : ''}
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      <span className="badge bg-soft-primary text-primary small">{p.totalBoxes} Boxes</span>
                      <span className="badge bg-light text-dark border small">{p.totalPrinted} pcs</span>
                      {(p.remainingBottles ?? 0) > 0 && (
                        <span className="badge bg-soft-warning text-warning-accent small">{p.remainingBottles} extra</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="companies-mobile-actions">
                  <Link to={`/productions/view/${p._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none companies-mobile-action-btn" title="View">
                    <i className="bi bi-eye fs-6" />
                  </Link>
                  <Can I="edit" a="production">
                    <Link to={`/productions/edit/${p._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Edit">
                      <i className="bi bi-pencil-square fs-6" />
                    </Link>
                  </Can>
                  <Can I="delete" a="production">
                    <button type="button" onClick={() => handleDelete(p._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none companies-mobile-action-btn" title="Delete">
                      <i className="bi bi-trash fs-6" />
                    </button>
                  </Can>
                </div>
              </div>
            );
          })}
          {paginatedItems.length === 0 && !loading && (
            <div className="companies-mobile-empty">No production logs found</div>
          )}
        </div>

        <div className="companies-list-desktop" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 120 }}>Sr No</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Date</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 80 }}>Image</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Company & Brand</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Product & Variant</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">Qty / Boxes</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((p, index) => {
                const variantId = p.variantId?._id || p.variantId;
                const variantImage =
                  p.variantId?.image ||
                  variants.find(v => v._id === variantId)?.image;
                return (
                  <tr key={p._id} className="align-middle border-bottom transition-all hover-bg-light">
                    <td className="py-3 ps-5 text-start">
                      <span className="text-muted fw-bold" style={{ fontSize: 13 }}>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="fw-600 text-dark">{formatProductionDate(p.date)}</div>
                      {daysFromToday(p.date) <= 2 && (
                        <div className="small text-muted" style={{ fontSize: 11 }}>
                          {parseProductionDate(p.date)?.toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {variantImage ? (
                        <img
                          src={`${V_URL}${variantImage}`}
                          alt={p.variantId?.variantName || 'Bottle'}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center text-muted mx-auto"
                          style={{ width: 48, height: 48, borderRadius: 8, fontSize: 18 }}
                        >
                          <i className="bi bi-image" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: 14 }}>
                        {p.brandId?.companyId?.name || p.bottleSpecId?.brandId?.companyId?.name || 'N/A'}
                      </div>
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
                      <div className="small text-muted mb-1">{p.variantId?.variantName} {p.variantId?.variantSize ? `(${p.variantId.variantSize})` : ''}</div>
                      {p.variantId?.coatingShade && (
                        <span className="badge bg-soft-warning text-warning-accent px-2 py-1 mt-1" style={{ fontSize: 10 }}>
                          Coating: {p.variantId.coatingShade}
                        </span>
                      )}
                      {p.variantId?.detectedTextColor && (
                        <span className="badge bg-light text-dark border px-2 py-1 mt-1" style={{ fontSize: 10 }}>
                          Text: {p.variantId.detectedTextColor}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <div className="fw-bold text-dark">{p.totalPrinted} <small className="text-muted fw-normal">pcs</small></div>
                        <span className="badge bg-soft-primary text-primary rounded-pill px-3 py-1" style={{ fontSize: 12 }}>
                          {p.totalBoxes} <small className="fw-normal">Boxes</small>
                        </span>
                        <span className="badge bg-soft-warning text-warning-accent rounded-pill px-3 py-1" style={{ fontSize: 12 }}>
                          {p.remainingBottles ?? 0} <small className="fw-normal">Extra Printed Bottles</small>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <Link to={`/productions/view/${p._id}`} className="btn btn-sm btn-outline-info border-0 rounded-3 shadow-none p-2" title="View">
                          <i className="bi bi-eye fs-6" />
                        </Link>
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
                );
              })}
              {paginatedItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">No production logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
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
