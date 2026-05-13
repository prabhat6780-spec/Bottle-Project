import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBottleSpecs } from '../redux/slices/bottleSpecSlice';
import { createVariant } from '../redux/slices/variantSlice';
import Swal from 'sweetalert2';

export default function AddVariant() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const { loading } = useSelector((state) => state.variants);

  const [formData, setFormData] = useState({
    productName: '',
    variantName: '',
    variantType: '',
    variantSize: '',
    status: 'active',
    bottleSpecId: ''
  });

  useEffect(() => {
    dispatch(fetchBottleSpecs());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createVariant(formData)).then((res) => {
      if (!res.error) {
        Swal.fire('Success!', `Variant "${formData.variantName}" added!`, 'success');
        navigate('/variants');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to add variant.', 'error');
      }
    });
  };

  const selectedSpec = bottleSpecs.find(s => s._id === formData.bottleSpecId);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/variants" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Add Variant</h1>
          <p className="page-subtitle">Create a new product variant for a specification</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Bottle Specification</label>
                    <select 
                      className="form-select custom-input-field" 
                      required
                      value={formData.bottleSpecId} 
                      onChange={(e) => setFormData({ ...formData, bottleSpecId: e.target.value })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Spec --</option>
                      {bottleSpecs.filter(s => s.status && s.brandId?.status).map(s => (
                        <option key={s._id} value={s._id}>{s.bottleName} ({s.brandId?.name || 'N/A'})</option>
                      ))}
                    </select>
                  </div>

                  {selectedSpec && (
                    <div className="col-md-12">
                      <div className="alert alert-info py-2 px-3 mb-0" style={{ fontSize: 13, borderRadius: 10 }}>
                        <i className="bi bi-info-circle me-2" />
                        Linked Brand: <strong>{selectedSpec.brandId?.name || 'N/A'}</strong>
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">Product Name</label>
                    <input
                      type="text"
                      className="form-control custom-input-field"
                      required
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">Variant Name</label>
                    <input
                      type="text"
                      className="form-control custom-input-field"
                      required
                      value={formData.variantName}
                      onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">Variant Type</label>
                    <input
                      type="text"
                      className="form-control custom-input-field"
                      required
                      value={formData.variantType}
                      onChange={(e) => setFormData({ ...formData, variantType: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">Variant Size</label>
                    <input
                      type="text"
                      className="form-control custom-input-field"
                      required
                      value={formData.variantSize}
                      onChange={(e) => setFormData({ ...formData, variantSize: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">Status</label>
                    <select 
                      className="form-select custom-input-field" 
                      value={formData.status} 
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Save Variant</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/variants')} className="btn-ghost px-5 py-3">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
