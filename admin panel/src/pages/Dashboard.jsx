import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Can } from '../context/AbilityContext';
import { fetchProductions } from '../redux/slices/productionSlice';
import { fetchVariants } from '../redux/slices/variantSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { fetchCompanies } from '../redux/slices/companySlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../redux/slices/bottleSpecSlice';

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

  const displayName = user?.name || 'Admin';

  useEffect(() => {
    dispatch(fetchProductions());
    dispatch(fetchVariants());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
    dispatch(fetchBrands());
    dispatch(fetchBottleSpecs());
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
          <p className="page-subtitle">Welcome back, {displayName}. Printing production overview.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Can I="read" a="production">
            <Link to="/productions" className="btn-ghost">
              <i className="bi bi-box-seam me-2" /> All Productions
            </Link>
          </Can>
          <Can I="create" a="production">
            <Link to="/productions/add" className="btn-accent">
              <i className="bi bi-plus-lg me-2" /> New Entry
            </Link>
          </Can>
        </div>
      </div>

      {loading && productions.length === 0 ? (
        <div className="dash-card p-5 text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div>Loading dashboard data...</div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {stats.map((s, i) => (
              <div className="col-6 col-xl-3 fade-in-up" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
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

          <div className="row g-3 mb-3">
            <div className="col-sm-4">
              <div className="dash-card h-100 p-3 d-flex align-items-center gap-3">
                <div className="stat-icon teal mb-0">
                  <i className="bi bi-box-fill" />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Today's Boxes</div>
                  <div className="h4 mb-0 fw-bold">{metrics.todayBoxes.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="dash-card h-100 p-3 d-flex align-items-center gap-3">
                <div className="stat-icon orange mb-0">
                  <i className="bi bi-plus-square-fill" />
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Today's Extra Printed</div>
                  <div className="h4 mb-0 fw-bold">{metrics.todayExtra.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="dash-card h-100 p-3">
                <div className="text-muted small fw-bold text-uppercase mb-2">Quick Actions</div>
                <div className="d-flex flex-wrap gap-2">
                  {quickActions.map(action => (
                    <Can key={action.to} I={action.action} a={action.subject}>
                      <Link
                        to={action.to}
                        className="btn btn-sm btn-light border px-3 py-2"
                        style={{ borderRadius: 10, fontSize: 12, fontWeight: 600 }}
                      >
                        <i className={`bi ${action.icon} me-1 text-primary`} />
                        {action.label}
                      </Link>
                    </Can>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-8">
              <div className="dash-card h-100">
                <div className="dash-card-header">
                  <span className="dash-card-title">Printing Output (Last 3 Days)</span>
                </div>
                <div className="dash-card-body">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={dailyChartData}>
                      <defs>
                        <linearGradient id="printedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ACCENT} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="boxesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="printed" name="Bottles printed" stroke={ACCENT} strokeWidth={2.5} fill="url(#printedGrad)" />
                      <Area type="monotone" dataKey="boxes" name="Boxes" stroke="#10b981" strokeWidth={2} fill="url(#boxesGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="d-flex gap-4 mt-2">
                    <span className="small text-muted">
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: ACCENT, marginRight: 6 }} />
                      Bottles printed
                    </span>
                    <span className="small text-muted">
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#10b981', marginRight: 6 }} />
                      Boxes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="dash-card h-100">
                <div className="dash-card-header">
                  <span className="dash-card-title">Daily Entries</span>
                </div>
                <div className="dash-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyChartData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: ACCENT_SOFT }} />
                      <Bar dataKey="entries" name="Production logs" fill={ACCENT} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 pt-3 border-top">
                    {catalogItems.map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="d-flex align-items-center justify-content-between py-2 text-decoration-none"
                        style={{ color: 'inherit' }}
                      >
                        <span className="small text-muted">
                          <i className={`bi ${item.icon} me-2`} style={{ color: ACCENT }} />
                          {item.label}
                        </span>
                        <span className="fw-bold small">{item.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">Recent Production Logs</span>
                  <Can I="read" a="production">
                    <Link to="/productions" className="btn-ghost py-1 px-3" style={{ fontSize: 12 }}>View All</Link>
                  </Can>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Brand</th>
                        <th>Variant</th>
                        <th>Printed</th>
                        <th>Boxes</th>
                        <th>Extra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProductions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted">
                            No production logs yet.{' '}
                            <Can I="create" a="production">
                              <Link to="/productions/add">Add first entry</Link>
                            </Can>
                          </td>
                        </tr>
                      ) : (
                        recentProductions.map(p => (
                          <tr key={p._id}>
                            <td className="fw-600">{dayLabel(normalizeDate(p.date), todayIso)}</td>
                            <td>{p.brandId?.name || p.bottleSpecId?.brandId?.name || '—'}</td>
                            <td>
                              <div className="small fw-600">{p.variantId?.productName || '—'}</div>
                              <div className="small text-muted">{p.variantId?.variantName || ''}</div>
                            </td>
                            <td className="fw-bold">{p.totalPrinted?.toLocaleString()}</td>
                            <td>
                              <span className="badge bg-soft-primary text-primary rounded-pill px-2 py-1" style={{ fontSize: 11 }}>
                                {p.totalBoxes ?? 0} Boxes
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-soft-warning text-warning-accent rounded-pill px-2 py-1" style={{ fontSize: 11 }}>
                                {p.remainingBottles ?? 0} Extra
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="dash-card h-100">
                <div className="dash-card-header">
                  <span className="dash-card-title">Top Variants by Volume</span>
                  <Can I="read" a="variant">
                    <Link to="/variants" className="btn-ghost py-1 px-3" style={{ fontSize: 12 }}>View All</Link>
                  </Can>
                </div>
                <div className="dash-card-body">
                  {topVariants.length === 0 ? (
                    <p className="text-muted small mb-0 text-center py-4">No production data to rank variants yet.</p>
                  ) : (
                    topVariants.map((v, i) => (
                      <div key={v.id} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</span>
                            {v.product && (
                              <span className="small text-muted d-block" style={{ fontSize: 11 }}>{v.product}</span>
                            )}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{v.printed.toLocaleString()}</span>
                        </div>
                        <div className="custom-progress">
                          <div
                            className="custom-progress-bar"
                            style={{ width: `${Math.round((v.printed / maxVariantPrinted) * 100)}%`, background: ACCENT }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
