import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
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
    variantSize: '',
    status: 'active',
    bottleSpecId: '',
    image: null,
    detectedTextColor: ''
  });
  const [analyzingColor, setAnalyzingColor] = useState(false);

  const [errors, setErrors] = useState({
    productName: '',
    variantName: '',
    bottleSpecId: ''
  });

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      productName: 'Product Name',
      variantName: 'Variant Name',
      bottleSpecId: 'Bottle Specification'
    };

    if (!value || value.trim() === '') {
      msg = `${fieldNames[name] || name} is mandatory`;
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

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      if (file) {
        setAnalyzingColor(true);
        const data = new FormData();
        data.append('image', file);
        try {
          const res = await API.post('/text-color/analyze', data);
          if (res.data?.success && res.data?.data?.detectedName) {
            setFormData(prev => ({ ...prev, detectedTextColor: res.data.data.detectedName }));
          } else {
            setFormData(prev => ({ ...prev, detectedTextColor: 'Not Detected' }));
          }
        } catch (err) {
          console.error("Color analysis error:", err);
          setFormData(prev => ({ ...prev, detectedTextColor: 'Analysis Failed' }));
        } finally {
          setAnalyzingColor(false);
        }
      } else {
        setFormData(prev => ({ ...prev, detectedTextColor: '' }));
      }
    } else {
      let cleanValue = value;
      if (name === 'detectedTextColor' && typeof cleanValue === 'string') {
        cleanValue = cleanValue.replace(/^\s+/, '');
      }
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    }
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
    if (prodError) return Swal.fire('Validation Error', prodError, 'error');
    if (varNameError) return Swal.fire('Validation Error', varNameError, 'error');

    const submitData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    }

    dispatch(createVariant(submitData)).then((res) => {
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
                        <option key={s._id} value={s._id}>
                          {s.bottleName} ({s.brandId?.name || 'N/A'}) - {s.printingTypeId?.name || 'N/A'} [{s.printingColorId?.name || 'N/A'}]
                        </option>
                      ))}
                    </select>
                    {errors.bottleSpecId && <div className="invalid-feedback">{errors.bottleSpecId}</div>}
                  </div>

                  {selectedSpec && (
                    <div className="col-md-12">
                      <div className="alert alert-info py-3 px-3 mb-0" style={{ fontSize: 13, borderRadius: 12, border: 'none', backgroundColor: '#e3f2fd', color: '#0d47a1' }}>
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-info-circle-fill me-2" />
                          <span className="fw-bold">Linked Specification Details:</span>
                        </div>
                        <div className="row g-2 mt-1">
                          <div className="col-md-4">
                            <span className="text-muted small text-uppercase fw-600 d-block">Brand</span>
                            <span className="fw-600">{selectedSpec.brandId?.name || 'N/A'}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="text-muted small text-uppercase fw-600 d-block">Printing Type</span>
                            <span className="fw-600">{selectedSpec.printingTypeId?.name || 'N/A'}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="text-muted small text-uppercase fw-600 d-block">Printing Color</span>
                            <span className="fw-600">{selectedSpec.printingColorId?.name || 'N/A'}</span>
                          </div>
                        </div>
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
                      Variant Size
                    </label>
                    <input
                      type="text"
                      name="variantSize"
                      className="form-control custom-input-field"
                      value={formData.variantSize}
                      onChange={handleChange}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted d-block mb-3">
                      Variant Image
                    </label>
                    <div className="d-flex align-items-end gap-3">
                      {formData.image && (
                        <div className="position-relative shadow-sm rounded-3 overflow-hidden border border-light-subtle" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                          <img src={URL.createObjectURL(formData.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger rounded-circle position-absolute p-0 d-flex align-items-center justify-content-center shadow" 
                            style={{ width: 22, height: 22, top: 4, right: 4 }}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: null }));
                              document.getElementById('imageInput').value = '';
                            }}
                          >
                            <i className="bi bi-x" style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <input
                          id="imageInput"
                          type="file"
                          name="image"
                          className="form-control custom-input-field"
                          onChange={handleChange}
                          accept="image/*"
                          style={{ borderRadius: 12 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Detected Text Color
                      {analyzingColor && <span className="spinner-border spinner-border-sm text-accent ms-2" role="status" />}
                    </label>
                    <input
                      type="text"
                      name="detectedTextColor"
                      className="form-control custom-input-field"
                      placeholder="Auto-detected on image upload"
                      value={formData.detectedTextColor}
                      onChange={handleChange}
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
