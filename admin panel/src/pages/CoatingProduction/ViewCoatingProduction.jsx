import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoatingProductions } from '../../redux/slices/coatingProductionSlice.js';
import { fetchVariants } from '../../redux/slices/variantSlice.js';
import { V_URL } from '../../../Baseurl.js';

const parseProductionDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return new Date(dateStr);
  return new Date(y, m - 1, d);
};

export default function ViewCoatingProduction() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { coatingProductions, loading } = useSelector((state) => state.coatingProductions);
  const { variants } = useSelector((state) => state.variants);
  const [production, setProduction] = useState(null);

  useEffect(() => {
    dispatch(fetchCoatingProductions({ pagination: 'false' }));
    dispatch(fetchVariants({ pagination: 'false' }));
  }, [dispatch]);

  useEffect(() => {
    const found = coatingProductions.find(p => p._id === id);
    if (found) {
      setProduction(found);
    }
  }, [id, coatingProductions]);

  if (loading || !production) return <div className="p-5 text-center">Loading...</div>;

  const variantId = production.variantId?._id || production.variantId;
  const variant = production.variantId || variants.find(v => v._id === variantId) || {};
  
  const variantImage = variant.image;
  const prodDate = parseProductionDate(production.date)?.toLocaleDateString() || 'N/A';

  // Determine the back link based on unit
  const unitNum = production.unit || '1';
  const backLink = `/coating-productions/unit/${unitNum}`;

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to={backLink} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Coating Production Detail</h1>
          <p className="page-subtitle">Viewing coating production log details — Unit {unitNum}</p>
        </div>
      </div>

      <div className="row mt-4">
        {/* Left Column - Variant Image & Info */}
        <div className="col-lg-4 mb-4">
          <div className="dash-card h-100 border-0 shadow-sm">
            <div className="dash-card-body text-center d-flex flex-column align-items-center p-4">
              <h5 className="fw-bold mb-4">Variant Image</h5>
              
              {variantImage ? (
                <img 
                  src={`${V_URL}${variantImage}`} 
                  alt={variant.variantName || 'Bottle'} 
                  className="img-fluid rounded-4 shadow-sm mb-3"
                  style={{ maxHeight: 250, objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light rounded-4 d-flex align-items-center justify-content-center mb-3 w-100" style={{ height: 200 }}>
                  <i className="bi bi-image text-muted" style={{ fontSize: 40 }} />
                </div>
              )}

              <h6 className="fw-bold text-dark mt-3">{variant.variantName || 'N/A'}</h6>
              
              <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center">
                {variant.variantSize && (
                  <span className="badge bg-soft-info text-info px-3 py-2 border rounded-pill" style={{ fontSize: 12 }}>
                    Size: {variant.variantSize}
                  </span>
                )}
                {variant.coatingShade && (
                  <span className="badge bg-soft-warning text-warning-accent px-3 py-2 border rounded-pill" style={{ fontSize: 12 }}>
                    Coating: {variant.coatingShade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Production & Specification Details */}
        <div className="col-lg-8 mb-4">
          <div className="dash-card h-100 border-0 shadow-sm">
            <div className="dash-card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Coating Production Information</h5>
              <div className="fw-bold text-accent px-3 py-1 bg-light rounded-pill">
                <i className="bi bi-calendar-event me-2"></i> Date: {prodDate}
              </div>
            </div>
            
            <div className="dash-card-body p-4">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Hierarchy Details</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Company</span>
                    <span className="fw-bold fs-6">{production.brandId?.companyId?.name || production.bottleSpecId?.brandId?.companyId?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Brand</span>
                    <span className="fw-bold fs-6 text-accent">{production.brandId?.name || production.bottleSpecId?.brandId?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Unit</span>
                    <span className="fw-bold fs-6">{unitNum}</span>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-muted text-uppercase small mb-3">Specification Details</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle h-100">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Bottle Spec Name</span>
                    <span className="fw-bold fs-6">{production.bottleSpecId?.bottleName || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle h-100">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Coating Configuration</span>
                    <div className="fw-bold fs-6">
                      Type: <span className="text-dark fw-normal">{production.bottleSpecId?.coatingTypeId?.name || 'N/A'}</span><br/>
                      Color: <span className="text-dark fw-normal">{production.bottleSpecId?.coatingColorId?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle h-100">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Operator Name</span>
                    <span className="fw-bold fs-6">{production.operatorName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-muted text-uppercase small mb-3">Production Quantities</h6>
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Actual Quantity</span>
                    <span className="fw-bold fs-4 text-dark">{production.actualQuantity || 0}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Rejection Qty</span>
                    <span className="fw-bold fs-4 text-danger">{production.rejectionQuantity || 0}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Total Actual Coated</span>
                    <span className="fw-bold fs-4 text-success">{production.totalActualCoatedBottle || 0}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-4 border border-light-subtle text-center h-100 d-flex flex-column justify-content-center">
                    <span className="text-uppercase small fw-bold text-muted d-block mb-1">Total Bottle Coated</span>
                    <span className="fw-bold fs-4 text-primary">{production.totalBottleCoated || 0}</span>
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
