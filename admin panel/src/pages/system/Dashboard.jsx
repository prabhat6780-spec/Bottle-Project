import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Can } from '../../context/AbilityContext';
import { fetchProductions } from '../../redux/slices/productionSlice';
import { fetchVariants } from '../../redux/slices/variantSlice';
import { fetchUsers } from '../../redux/slices/userSlice';
import { fetchCompanies } from '../../redux/slices/companySlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice';
import { fetchCoatingProductions } from '../../redux/slices/coatingProductionSlice';
import { fetchCoatingSpecs } from '../../redux/slices/coatingSpecSlice';

const ACCENT = '#00aeef';
const ACCENT_SOFT = 'rgba(0, 174, 239, 0.12)';

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const normalizeDate = (dateStr) => (dateStr ? String(dateStr).split('T')[0] : '');

const dayLabel = (iso, todayIso) => {
  if (iso === todayIso) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === toIsoDate(yesterday)) return 'Yesterday';
  const twoDays = new Date();
  twoDays.setDate(twoDays.getDate() - 2);
  if (iso === toIsoDate(twoDays)) return 'Day before yesterday';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: '2px 0' }}>
          {Number(p.value).toLocaleString()} <span style={{ fontWeight: 400, color: '#94a3b8' }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { productions, loading: productionsLoading } = useSelector((state) => state.productions);
  const { variants } = useSelector((state) => state.variants);
  const { users } = useSelector((state) => state.users);
  const { companies } = useSelector((state) => state.companies);
  const { brands } = useSelector((state) => state.brands);
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const { coatingProductions } = useSelector((state) => state.coatingProductions);
  const { coatingSpecs } = useSelector((state) => state.coatingSpecs);

  const displayName = user?.name || 'Admin';

  // Coating filter states
  const [coatingFilterType, setCoatingFilterType] = useState('date');
  const [coatingFilterDate, setCoatingFilterDate] = useState(toIsoDate(new Date()));
  const [coatingFilterMonth, setCoatingFilterMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [coatingFilterYear, setCoatingFilterYear] = useState(String(new Date().getFullYear()));

  // Printing filter states
  const [printingFilterType, setPrintingFilterType] = useState('date');
  const [printingFilterDate, setPrintingFilterDate] = useState(toIsoDate(new Date()));
  const [printingFilterMonth, setPrintingFilterMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [printingFilterYear, setPrintingFilterYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    dispatch(fetchProductions({ pagination: 'false' }));
    dispatch(fetchVariants({ pagination: 'false' }));
    dispatch(fetchUsers({ pagination: 'false' }));
    dispatch(fetchCompanies({ pagination: 'false' }));
    dispatch(fetchBrands({ pagination: 'false' }));
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
    dispatch(fetchCoatingProductions({ pagination: 'false' }));
    dispatch(fetchCoatingSpecs({ pagination: 'false' }));
  }, [dispatch]);

  const todayIso = toIsoDate(new Date());

  const metrics = useMemo(() => {
    const todayRecords = productions.filter(p => normalizeDate(p.date) === todayIso);
    const todayPrinted = todayRecords.reduce((sum, p) => sum + (p.totalPrinted || 0), 0);
    const todayBoxes = todayRecords.reduce((sum, p) => sum + (p.totalBoxes || 0), 0);
    const todayExtra = todayRecords.reduce((sum, p) => sum + (p.remainingBottles || 0), 0);
    const totalPrinted = productions.reduce((sum, p) => sum + (p.totalPrinted || 0), 0);
    const activeVariants = variants.filter(v => v.status !== false).length;

    return {
      todayPrinted,
      todayEntries: todayRecords.length,
      todayBoxes,
      todayExtra,
      totalPrinted,
      totalEntries: productions.length,
      activeVariants,
      totalVariants: variants.length,
      usersCount: Array.isArray(users) ? users.length : 0,
      companiesCount: companies.length,
      brandsCount: brands.length,
      specsCount: bottleSpecs.length,
    };
  }, [productions, variants, users, companies, brands, bottleSpecs, todayIso]);

  // Total coating metrics (Row 1)
  const coatingTotals = useMemo(() => {
    let totalCoated = 0, totalActual = 0, totalRejection = 0, totalBoxes = 0;
    (coatingProductions || []).forEach(p => {
      totalCoated += Number(p.totalBottleCoated) || Number(p.totalActualCoatedBottle) || 0;
      totalActual += Number(p.actualQuantity) || 0;
      totalRejection += Number(p.rejectionQuantity) || 0;
      const bpb = Number(p.bottlePerBox) || 0;
      const actual = Number(p.actualQuantity) || 0;
      totalBoxes += bpb > 0 ? Math.floor(actual / bpb) : 0;
    });
    return {
      totalCoated, totalActual, totalRejection, totalBoxes,
      totalRejectionPercentage: totalCoated > 0 ? ((totalRejection / totalCoated) * 100).toFixed(2) : '0.00',
      totalEntries: (coatingProductions || []).length,
      coatingSpecsCount: (coatingSpecs || []).length,
    };
  }, [coatingProductions, coatingSpecs]);

  // Filtered coating metrics (Row 2)
  const coatingFiltered = useMemo(() => {
    let coated = 0, actual = 0, rejection = 0, boxes = 0, entries = 0;
    let label = '';

    (coatingProductions || []).forEach(p => {
      const dateStr = normalizeDate(p.date);
      let match = false;

      if (coatingFilterType === 'date') {
        match = dateStr === coatingFilterDate;
      } else if (coatingFilterType === 'month') {
        // coatingFilterMonth is 'YYYY-MM'
        match = dateStr.substring(0, 7) === coatingFilterMonth;
      } else if (coatingFilterType === 'year') {
        match = dateStr.substring(0, 4) === coatingFilterYear;
      }

      if (match) {
        coated += Number(p.totalBottleCoated) || Number(p.totalActualCoatedBottle) || 0;
        actual += Number(p.actualQuantity) || 0;
        rejection += Number(p.rejectionQuantity) || 0;
        const bpb = Number(p.bottlePerBox) || 0;
        const act = Number(p.actualQuantity) || 0;
        boxes += bpb > 0 ? Math.floor(act / bpb) : 0;
        entries++;
      }
    });

    if (coatingFilterType === 'date') {
      const d = new Date(coatingFilterDate);
      label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } else if (coatingFilterType === 'month') {
      const [y, m] = coatingFilterMonth.split('-');
      const d = new Date(Number(y), Number(m) - 1);
      label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      label = `Year ${coatingFilterYear}`;
    }

    const rejectionPercentage = coated > 0 ? ((rejection / coated) * 100).toFixed(2) : '0.00';

    return { coated, actual, rejection, boxes, entries, label, rejectionPercentage };
  }, [coatingProductions, coatingFilterType, coatingFilterDate, coatingFilterMonth, coatingFilterYear]);

  // Filtered printing metrics (Row 2)
  const printingFiltered = useMemo(() => {
    let printed = 0, entries = 0;
    let label = '';
    const variantSet = new Set();
    const specSet = new Set();

    (productions || []).forEach(p => {
      const dateStr = normalizeDate(p.date);
      let match = false;

      if (printingFilterType === 'date') {
        match = dateStr === printingFilterDate;
      } else if (printingFilterType === 'month') {
        match = dateStr.substring(0, 7) === printingFilterMonth;
      } else if (printingFilterType === 'year') {
        match = dateStr.substring(0, 4) === printingFilterYear;
      }

      if (match) {
        printed += Number(p.totalPrinted) || 0;
        entries++;
        if (p.variantId) variantSet.add(p.variantId._id || p.variantId);
        if (p.bottleSpecId) specSet.add(p.bottleSpecId._id || p.bottleSpecId);
      }
    });

    if (printingFilterType === 'date') {
      const d = new Date(printingFilterDate);
      label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } else if (printingFilterType === 'month') {
      const [y, m] = printingFilterMonth.split('-');
      const d = new Date(Number(y), Number(m) - 1);
      label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      label = `Year ${printingFilterYear}`;
    }

    return { printed, variantsCount: variantSet.size, specsCount: specSet.size, entries, label };
  }, [productions, printingFilterType, printingFilterDate, printingFilterMonth, printingFilterYear]);

  const dailyChartData = useMemo(() => {
    const dayKeys = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayKeys.push(toIsoDate(d));
    }

    return dayKeys.map(iso => {
      const records = productions.filter(p => normalizeDate(p.date) === iso);
      return {
        label: dayLabel(iso, todayIso),
        printed: records.reduce((s, p) => s + (p.totalPrinted || 0), 0),
        boxes: records.reduce((s, p) => s + (p.totalBoxes || 0), 0),
        entries: records.length,
      };
    });
  }, [productions, todayIso]);

  const topVariants = useMemo(() => {
    const totals = {};
    productions.forEach(p => {
      const id = p.variantId?._id || p.variantId;
      if (!id) return;
      totals[id] = (totals[id] || 0) + (p.totalPrinted || 0);
    });

    return Object.entries(totals)
      .map(([id, printed]) => {
        const v = variants.find(x => x._id === id);
        const fromProd = productions.find(p => (p.variantId?._id || p.variantId) === id);
        return {
          id,
          name: v?.variantName || fromProd?.variantId?.variantName || 'Unknown variant',
          product: v?.productName || fromProd?.variantId?.productName || '',
          printed,
        };
      })
      .sort((a, b) => b.printed - a.printed)
      .slice(0, 5);
  }, [productions, variants]);

  const recentProductions = useMemo(() => {
    return [...productions]
      .sort((a, b) => {
        const dateCmp = normalizeDate(b.date).localeCompare(normalizeDate(a.date));
        if (dateCmp !== 0) return dateCmp;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 6);
  }, [productions]);

  const maxVariantPrinted = topVariants[0]?.printed || 1;

  const stats = [
    {
      label: "Today's Printed",
      value: metrics.todayPrinted.toLocaleString(),
      sub: `${metrics.todayEntries} log${metrics.todayEntries !== 1 ? 's' : ''} today`,
      icon: 'bi-printer-fill',
      color: 'teal',
    },
    {
      label: 'Total Printed',
      value: metrics.totalPrinted.toLocaleString(),
      sub: `${metrics.totalEntries} production entries`,
      icon: 'bi-box-seam-fill',
      color: 'purple',
    },
    {
      label: 'Active Variants',
      value: metrics.activeVariants.toLocaleString(),
      sub: `${metrics.totalVariants} variants in catalog`,
      icon: 'bi-layers-fill',
      color: 'green',
    },
    {
      label: 'Bottle Specs',
      value: metrics.specsCount.toLocaleString(),
      sub: `${metrics.brandsCount} brands · ${metrics.companiesCount} companies`,
      icon: 'bi-droplet-fill',
      color: 'orange',
    },
  ];

  const catalogItems = [
    { label: 'Companies', count: metrics.companiesCount, icon: 'bi-building-fill', to: '/companies' },
    { label: 'Brands', count: metrics.brandsCount, icon: 'bi-award-fill', to: '/brands' },
    { label: 'Bottle Specs', count: metrics.specsCount, icon: 'bi-droplet-fill', to: '/bottle-specs' },
    { label: 'Users', count: metrics.usersCount, icon: 'bi-people-fill', to: '/users' },
  ];

  const quickActions = [
    { label: 'New Production', icon: 'bi-plus-circle-fill', to: '/productions/add', action: 'create', subject: 'production' },
    { label: 'Production Logs', icon: 'bi-box-seam-fill', to: '/productions', action: 'read', subject: 'production' },
    { label: 'Add Variant', icon: 'bi-layers-fill', to: '/variants/add', action: 'create', subject: 'variant' },
    { label: 'Add Bottle Spec', icon: 'bi-droplet-fill', to: '/bottle-specs/add', action: 'create', subject: 'bottlespec' },
  ];

  const loading = productionsLoading;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {displayName}.</p>
        </div>
      </div>

      {loading && productions.length === 0 ? (
        <div className="dash-card p-5 text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div>Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {/* ── Printing Production Overview ── */}
          <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3 mt-2">
            <div>
              <h2 className="page-title" style={{ fontSize: 22 }}>
                <i className="bi bi-printer me-2" style={{ color: ACCENT }} />
                Printing Production Overview
              </h2>
              <p className="page-subtitle mb-0">Printing production summary across all units.</p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {stats.map((s, i) => (
              <div className="col-12 col-sm-6 col-xl-3 fade-in-up" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`stat-card ${s.color}`}>
                  <div className={`stat-icon ${s.color}`}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change up" style={{ color: 'var(--text-muted)' }}>
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 — Filter by Date / Month / Year */}
          <div className="dash-card mb-4">
            <div className="dash-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span className="dash-card-title">Printing Summary — {printingFiltered.label}</span>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {[
                  { key: 'date', label: 'Date', icon: 'bi-calendar-day' },
                  { key: 'month', label: 'Month', icon: 'bi-calendar-month' },
                  { key: 'year', label: 'Year', icon: 'bi-calendar-range' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setPrintingFilterType(f.key)}
                    className={`btn btn-sm ${printingFilterType === f.key ? 'btn-primary' : 'btn-light border'}`}
                    style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '5px 14px' }}
                  >
                    <i className={`bi ${f.icon} me-1`} />{f.label}
                  </button>
                ))}

                {printingFilterType === 'date' && (
                  <input
                    type="date"
                    value={printingFilterDate}
                    onChange={e => setPrintingFilterDate(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: 160, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  />
                )}
                {printingFilterType === 'month' && (
                  <input
                    type="month"
                    value={printingFilterMonth}
                    onChange={e => setPrintingFilterMonth(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: 160, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  />
                )}
                {printingFilterType === 'year' && (
                  <select
                    value={printingFilterYear}
                    onChange={e => setPrintingFilterYear(e.target.value)}
                    className="form-select form-select-sm"
                    style={{ width: 110, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="dash-card-body">
              <div className="row g-3">
                {[
                  { label: 'Printed', value: printingFiltered.printed.toLocaleString(), sub: `${printingFiltered.entries} entries`, icon: 'bi-printer-fill', color: 'teal' },
                  { label: 'Variants', value: printingFiltered.variantsCount.toLocaleString(), sub: printingFiltered.label, icon: 'bi-layers-fill', color: 'green' },
                  { label: 'Bottle Specs', value: printingFiltered.specsCount.toLocaleString(), sub: printingFiltered.label, icon: 'bi-droplet-fill', color: 'orange' },
                ].map((s, i) => (
                  <div className="col-12 col-sm-6 col-xl-4 fade-in-up" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={`stat-card ${s.color}`}>
                      <div className={`stat-icon ${s.color}`}>
                        <i className={`bi ${s.icon}`} />
                      </div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-change up" style={{ color: 'var(--text-muted)' }}>
                        {s.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          

         

          {/* ── Coating Production Overview ── */}
          <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3 mt-5 mb-3">
            <div>
              <h2 className="page-title" style={{ fontSize: 22 }}>
                <i className="bi bi-paint-bucket me-2" style={{ color: '#e91e63' }} />
                Coating Production Overview
              </h2>
              <p className="page-subtitle mb-0">Coating production summary across all units.</p>
            </div>
          </div>

          {/* Row 1 — Total Coating Stats */}
          <div className="row g-3 mb-3">
            {[
              { label: 'Total Coating', value: coatingTotals.totalCoated.toLocaleString(), sub: `${coatingTotals.totalEntries} total entries`, icon: 'bi-paint-bucket', color: 'teal' },
              { label: 'Total Actual', value: coatingTotals.totalActual.toLocaleString(), sub: 'All-time actual quantity', icon: 'bi-check-circle-fill', color: 'green' },
              { label: 'Total Rejection', value: coatingTotals.totalRejection.toLocaleString(), sub: 'All-time rejected', icon: 'bi-x-circle-fill', color: 'orange' },
              { label: 'Total Boxes', value: coatingTotals.totalBoxes.toLocaleString(), sub: 'All-time boxes packed', icon: 'bi-box-seam-fill', color: 'purple' },
              { label: 'Coating Specs', value: coatingTotals.coatingSpecsCount.toLocaleString(), sub: 'Active specifications', icon: 'bi-droplet-half', color: 'green' },
            ].map((s, i) => (
              <div className="col-12 col-sm-6 col-xl fade-in-up" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`stat-card ${s.color}`}>
                  <div className={`stat-icon ${s.color}`}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change up" style={{ color: 'var(--text-muted)' }}>
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 — Filter by Date / Month / Year */}
          <div className="dash-card mb-4">
            <div className="dash-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span className="dash-card-title">Coating Summary — {coatingFiltered.label}</span>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Filter type tabs */}
                {[
                  { key: 'date', label: 'Date', icon: 'bi-calendar-day' },
                  { key: 'month', label: 'Month', icon: 'bi-calendar-month' },
                  { key: 'year', label: 'Year', icon: 'bi-calendar-range' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setCoatingFilterType(f.key)}
                    className={`btn btn-sm ${coatingFilterType === f.key ? 'btn-primary' : 'btn-light border'}`}
                    style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '5px 14px' }}
                  >
                    <i className={`bi ${f.icon} me-1`} />{f.label}
                  </button>
                ))}

                {/* Date/Month/Year input */}
                {coatingFilterType === 'date' && (
                  <input
                    type="date"
                    value={coatingFilterDate}
                    onChange={e => setCoatingFilterDate(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: 160, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  />
                )}
                {coatingFilterType === 'month' && (
                  <input
                    type="month"
                    value={coatingFilterMonth}
                    onChange={e => setCoatingFilterMonth(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: 160, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  />
                )}
                {coatingFilterType === 'year' && (
                  <select
                    value={coatingFilterYear}
                    onChange={e => setCoatingFilterYear(e.target.value)}
                    className="form-select form-select-sm"
                    style={{ width: 110, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="dash-card-body">
              <div className="row g-3">
                {[
                  { label: 'Coating', value: coatingFiltered.coated.toLocaleString(), sub: `${coatingFiltered.entries} entries`, icon: 'bi-paint-bucket', color: 'teal' },
                  { label: 'Actual', value: coatingFiltered.actual.toLocaleString(), sub: coatingFiltered.label, icon: 'bi-check-circle-fill', color: 'green' },
                  { label: 'Rejection', value: coatingFiltered.rejection.toLocaleString(), sub: coatingFiltered.label, icon: 'bi-x-circle-fill', color: 'orange' },
                  { label: 'Boxes', value: coatingFiltered.boxes.toLocaleString(), sub: coatingFiltered.label, icon: 'bi-box-seam-fill', color: 'purple' },
                ].map((s, i) => (
                  <div className="col-12 col-sm-6 col-xl-3 fade-in-up" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={`stat-card ${s.color}`}>
                      <div className={`stat-icon ${s.color}`}>
                        <i className={`bi ${s.icon}`} />
                      </div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-change up" style={{ color: 'var(--text-muted)' }}>
                        {s.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 — Rejection Percentage */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="dash-card h-100 p-3 d-flex align-items-center gap-3">
                <div className="stat-icon orange mb-0">
                  <i className="bi bi-percent" />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Total Rejection %</div>
                  <div className="h4 mb-0 fw-bold">{coatingTotals.totalRejectionPercentage}%</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="dash-card h-100 p-3 d-flex align-items-center gap-3">
                <div className="stat-icon orange mb-0">
                  <i className="bi bi-percent" />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">
                    {coatingFilterType === 'date'
                      ? `${new Date(coatingFilterDate).toLocaleDateString()} Rejection %`
                      : coatingFilterType === 'month'
                        ? `${new Date(coatingFilterMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })} Rejection %`
                        : `Year ${coatingFilterYear} Rejection %`}
                  </div>
                  <div className="h4 mb-0 fw-bold">{coatingFiltered.rejectionPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
