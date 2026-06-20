import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCoatingSpec } from '../../redux/slices/coatingSpecSlice';
import Swal from 'sweetalert2';
import { V_URL } from '../../../Baseurl.js';

export default function ViewCoatingSpec() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { coatingSpecs } = useSelector((state) => state.coatingSpecs);
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    const found = coatingSpecs.find(s => s._id === id);
    if (found) {
      setSpec(found);
    }
  }, [id, coatingSpecs]);

  const toggleStatus = () => {
    const isActive = spec.status === true || spec.status === 'active' || spec.status === undefined;
    const newStatus = !isActive;

    Swal.fire({
      title: `Mark as ${newStatus ? 'ACTIVE' : 'INACTIVE'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#007236' : '#e91e63',
      confirmButtonText: `Yes, make ${newStatus ? 'ACTIVE' : 'INACTIVE'}`
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(updateCoatingSpec({ id: spec._id, formData: { status: newStatus } })).then((res) => {
          if (!res.error) {
            Swal.fire('Updated!', `Coating Spec is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
          } else {
            Swal.fire('Error!', res.payload || 'Failed to update status.', 'error');
          }
        });
      }
    });
  };

  if (!spec) return <div className="p-5">Loading...</div>;

  const isActive = spec.status === true || spec.status === 'active' || spec.status === undefined;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
        <Link to="/coating-specs" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <h1 className="page-title">Coating Spec Detailed</h1>
      </div>

      <div className="row mt-4">
        {/* Left Card — Image & Status */}
        <div className="col-lg-4 mb-4">
          <div className="dash-card h-100">
            <div className="dash-card-body text-center d-flex flex-column align-items-center justify-content-center p-4">
              {spec.image ? (
                <img
                  src={`${V_URL}${spec.image}`}
                  alt={spec.bottleName}
                  className="img-fluid rounded-4 shadow-sm mb-3"
                  style={{ maxHeight: 250, objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light rounded-4 d-flex align-items-center justify-content-center mb-3" style={{ width: 150, height: 150 }}>
                  <i className="bi bi-image text-muted" style={{ fontSize: 40 }} />
                </div>
              )}

              <p className="fw-bold fs-6 mb-0">{spec.bottleName}</p>
              {spec.code && (
                <p className="text-muted small mb-0"><code>{spec.code}</code></p>
              )}

              <div className="mt-3 d-flex gap-2 justify-content-center flex-wrap">
                <span className={`badge-status badge-${isActive ? 'active' : 'inactive'}`}>
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                {spec.coatingShade && (
                  <span className="badge bg-soft-info text-dark px-3 py-2 border rounded-pill" style={{ fontSize: 12 }}>
                    {spec.coatingShade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card — Details */}
        <div className="col-lg-8 mb-4">
          <div className="dash-card h-100">
            <div className="dash-card-header bg-white border-bottom p-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0 fw-bold">Coating Spec Information</h5>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="bg-light px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-2" style={{ fontSize: 13, color: '#333' }}>
                  <i className="bi bi-calendar-event"></i>
                  <span>Date: {spec.createdAt ? new Date(spec.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <button
                  onClick={toggleStatus}
                  className={`btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm px-4 py-2 fw-bold rounded-pill shadow-none`}
                  style={{ fontSize: 12 }}
                >
                  {isActive ? 'MARK INACTIVE' : 'MARK ACTIVE'}
                </button>
              </div>
            </div>
            <div className="dash-card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Company Name</span>
                    <span className="fw-bold fs-6">{spec.brandId?.companyId?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Brand Name</span>
                    <span className="fw-bold fs-6 text-accent">{spec.brandId?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Bottle Name</span>
                    <span className="fw-bold fs-6">{spec.bottleName || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Bottle Code</span>
                    <span className="fw-bold fs-6"><code>{spec.code || '—'}</code></span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Variant</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold fs-6">{spec.variantId ? `${spec.variantId.variantName} - ${spec.variantId.variantSize}` : '—'}</span>
                      {spec.variantId?.image && (
                        <div className="border rounded-3 overflow-hidden shadow-sm" style={{ width: 80, height: 80, flexShrink: 0 }}>
                          <img src={`${V_URL}${spec.variantId.image}`} alt="Variant" className="w-100 h-100 object-fit-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Coating Type</span>
                    <span className="fw-bold fs-6">{spec.coatingTypeId?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Coating Shade</span>
                    <span className="fw-bold fs-6">{spec.coatingShade || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
