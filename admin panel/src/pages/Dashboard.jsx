import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const areaData = [
  { month: 'Jan', revenue: 4200, users: 1800 },
  { month: 'Feb', revenue: 5800, users: 2400 },
  { month: 'Mar', revenue: 4900, users: 2100 },
  { month: 'Apr', revenue: 7200, users: 3200 },
  { month: 'May', revenue: 6100, users: 2700 },
  { month: 'Jun', revenue: 8900, users: 4100 },
  { month: 'Jul', revenue: 9400, users: 4600 },
  { month: 'Aug', revenue: 8200, users: 3900 },
  { month: 'Sep', revenue: 11000, users: 5200 },
  { month: 'Oct', revenue: 10200, users: 4800 },
  { month: 'Nov', revenue: 12400, users: 5900 },
  { month: 'Dec', revenue: 14800, users: 6700 },
];

const barData = [
  { day: 'Mon', sales: 38 },
  { day: 'Tue', sales: 52 },
  { day: 'Wed', sales: 61 },
  { day: 'Thu', sales: 45 },
  { day: 'Fri', sales: 78 },
  { day: 'Sat', sales: 90 },
  { day: 'Sun', sales: 43 },
];

const stats = [
  { label: 'Total Revenue', value: '$142,580', change: '+18.2%', up: true, icon: 'bi-currency-dollar', color: 'purple' },
  { label: 'Active Users',  value: '28,492',   change: '+12.5%', up: true, icon: 'bi-people-fill',     color: 'teal'   },
  { label: 'New Orders',    value: '3,847',    change: '+8.1%',  up: true, icon: 'bi-cart-fill',       color: 'green'  },
  { label: 'Bounce Rate',   value: '24.6%',    change: '-3.4%',  up: false, icon: 'bi-graph-down',     color: 'orange' },
];

const recentOrders = [
  { id: '#ORD-8821', customer: 'Emma Wilson',   product: 'Pro License',    amount: '$299',  status: 'active' },
  { id: '#ORD-8820', customer: 'James Carter',  product: 'Enterprise Plan', amount: '$899', status: 'pending' },
  { id: '#ORD-8819', customer: 'Sophia Lee',    product: 'Starter Pack',   amount: '$49',   status: 'active' },
  { id: '#ORD-8818', customer: 'Liam Johnson',  product: 'Pro License',    amount: '$299',  status: 'inactive' },
  { id: '#ORD-8817', customer: 'Olivia Brown',  product: 'Team Bundle',    amount: '$599',  status: 'active' },
];

const activities = [
  { icon: 'bi-person-plus-fill', color: 'purple', text: <><strong>Emma Wilson</strong> created a new account</>, time: '2 minutes ago' },
  { icon: 'bi-cart-check-fill',  color: 'green',  text: <><strong>James Carter</strong> placed order <strong>#ORD-8820</strong></>, time: '14 minutes ago' },
  { icon: 'bi-shield-check-fill',color: 'cyan',   text: <>Security scan completed — <strong>0 threats found</strong></>, time: '1 hour ago' },
  { icon: 'bi-exclamation-triangle-fill', color: 'orange', text: <>Server CPU usage peaked at <strong>89%</strong></>, time: '2 hours ago' },
  { icon: 'bi-file-earmark-check-fill', color: 'green', text: <><strong>Monthly report</strong> generated successfully</>, time: '3 hours ago' },
  { icon: 'bi-x-circle-fill',   color: 'red',    text: <>Payment failed for order <strong>#ORD-8815</strong></>, time: '5 hours ago' },
];

const topProducts = [
  { name: 'Enterprise Plan', sales: 482, pct: 82 },
  { name: 'Pro License',     sales: 371, pct: 63 },
  { name: 'Team Bundle',     sales: 294, pct: 50 },
  { name: 'Starter Pack',    sales: 189, pct: 32 },
  { name: 'Add-on Module',   sales: 97,  pct: 16 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1d2a', border: '1px solid #2d3348', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: '2px 0' }}>
            {p.name === 'revenue' ? '$' : ''}{p.value.toLocaleString()} <span style={{ fontWeight: 400, color: '#64748b' }}>{p.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Admin 👋 Here's what's happening today.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-ghost"><i className="bi bi-download" /> Export</button>
          <button className="btn-accent"><i className="bi bi-plus" /> New Report</button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-6 col-xl-3 fade-in-up" key={i}>
            <div className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}>
                <i className={`bi ${s.icon}`} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                <i className={`bi ${s.up ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`} />
                {s.change} vs last month
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="dash-card h-100">
            <div className="dash-card-header">
              <span className="dash-card-title">Revenue &amp; Users Overview</span>
              <div className="d-flex gap-2">
                {['1W','1M','3M','1Y'].map(r => (
                  <button key={r} className="btn-ghost py-1 px-2" style={{ fontSize: 12 }}>{r}</button>
                ))}
              </div>
            </div>
            <div className="dash-card-body">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="users"   stroke="#06b6d4" strokeWidth={2.5} fill="url(#usrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="d-flex gap-4 mt-2">
                <span style={{ fontSize: 12, color: '#94a3b8' }}><span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'#6366f1', marginRight:6 }} />Revenue</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}><span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'#06b6d4', marginRight:6 }} />Users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="dash-card h-100">
            <div className="dash-card-header">
              <span className="dash-card-title">Weekly Sales</span>
            </div>
            <div className="dash-card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={20}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.07)' }} content={<CustomTooltip />} />
                  <Bar dataKey="sales" fill="url(#barGrad)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Best day</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Saturday (90)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Weekly total</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>407 sales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="row g-3">
        {/* Recent Orders */}
        <div className="col-lg-7">
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Recent Orders</span>
              <button className="btn-ghost py-1 px-3" style={{ fontSize: 12 }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.product}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.amount}</td>
                      <td>
                        <span className={`badge-status badge-${o.status}`}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-5 d-flex flex-column gap-3">
          {/* Top Products */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Top Products</span>
            </div>
            <div className="dash-card-body">
              {topProducts.map((p, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.sales}</span>
                  </div>
                  <div className="custom-progress">
                    <div className="custom-progress-bar" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Recent Activity</span>
            </div>
            <div className="dash-card-body">
              {activities.slice(0, 4).map((a, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${a.color}`}>
                    <i className={`bi ${a.icon}`} />
                  </div>
                  <div>
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
