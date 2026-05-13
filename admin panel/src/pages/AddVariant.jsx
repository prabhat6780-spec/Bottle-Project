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

  const [errors, setErrors] = useState({
    productName: '',
    variantName: '',
    variantType: '',
    variantSize: '',
    bottleSpecId: ''
  });

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      productName: 'Product Name',
      variantName: 'Variant Name',
      variantType: 'Variant Type',
      variantSize: 'Variant Size',
      bottleSpecId: 'Bottle Specification'
    };

    if (!value) {
      msg = `${fieldNames[name] || name} is mandatory`;
    } else if (name !== 'bottleSpecId' && /\s/.test(value)) {
      msg = 'Whitespace is not allowed';
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    if (msg) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Warning',
        text: msg,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = (name === 'bottleSpecId' || name === 'status') ? value : value.replace(/\s/g, '');
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    dispatch(fetchBottleSpecs());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const specError = validateField('bottleSpecId', formData.bottleSpecId);
    const prodError = validateField('productName', formData.productName);
    const varNameError = validateField('variantName', formData.variantName);
    const varTypeError = validateField('variantType', formData.variantType);
    const varSizeError = validateField('variantSize', formData.variantSize);

    if (specError) return Swal.fire('Validation Error', specError, 'error');
    if (prodError) return Swal.fire('Validation Error', prodError, 'error');
    if (varNameError) return Swal.fire('Validation Error', varNameError, 'error');
    if (varTypeError) return Swal.fire('Validation Error', varTypeError, 'error');
    if (varSizeError) return Swal.fire('Validation Error', varSizeError, 'error');

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
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottle Specification <span className="text-danger">*</span>
                    </label>
                    <select 
                      className={`form-select custom-input-field ${errors.bottleSpecId ? 'is-invalid' : ''}`}
                      name="bottleSpecId"
                      required
                      value={formData.bottleSpecId} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Spec --</option>
                      {bottleSpecs.filter(s => s.status && s.brandId?.status).map(s => (
                        <option key={s._id} value={s._id}>{s.bottleName} ({s.brandId?.name || 'N/A'})</option>
                      ))}
                    </select>
                    {errors.bottleSpecId && <div className="invalid-feedback">{errors.bottleSpecId}</div>}
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
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      className={`form-control custom-input-field ${errors.productName ? 'is-invalid' : ''}`}
                      required
                      value={formData.productName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Variant Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="variantName"
                      className={`form-control custom-input-field ${errors.variantName ? 'is-invalid' : ''}`}
                      required
                      value={formData.variantName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.variantName && <div className="invalid-feedback">{errors.variantName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Variant Type <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="variantType"
                      className={`form-control custom-input-field ${errors.variantType ? 'is-invalid' : ''}`}
                      required
                      value={formData.variantType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.variantType && <div className="invalid-feedback">{errors.variantType}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Variant Size <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="variantSize"
                      className={`form-control custom-input-field ${errors.variantSize ? 'is-invalid' : ''}`}
                      required
                      value={formData.variantSize}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.variantSize && <div className="invalid-feedback">{errors.variantSize}</div>}
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
