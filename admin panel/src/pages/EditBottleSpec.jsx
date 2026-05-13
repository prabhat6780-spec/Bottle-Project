import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateBottleSpec } from '../redux/slices/bottleSpecSlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import Swal from 'sweetalert2';

export default function EditBottleSpec() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bottleSpecs, loading } = useSelector((state) => state.bottleSpecs);
  const { brands } = useSelector((state) => state.brands);

  const [formData, setFormData] = useState({
    brandId: '',
    bottleName: '',
    code: '',
    printingType: '',
    printingSubType: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({
    brandId: '',
    bottleName: '',
    code: '',
    printingType: '',
    printingSubType: ''
  });

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      brandId: 'Brand',
      bottleName: 'Bottle Name',
      code: 'Bottle Code',
      printingType: 'Printing Type',
      printingSubType: 'Subprinting'
    };

    if (!value) {
      msg = `${fieldNames[name] || name} is mandatory`;
    } else if (name !== 'brandId' && /\s/.test(value)) {
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
    const cleanValue = (name === 'brandId' || name === 'status') ? value : value.replace(/\s/g, '');
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    const spec = bottleSpecs.find(s => s._id === id);
    if (spec) {
      setFormData({
        brandId: spec.brandId?._id || spec.brandId || '',
        bottleName: spec.bottleName || '',
        code: spec.code || '',
        printingType: spec.printingType || '',
        printingSubType: spec.printingSubType || '',
        status: spec.status === true ? 'active' : 'inactive'
      });
    }
  }, [id, bottleSpecs]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const brandError = validateField('brandId', formData.brandId);
    const nameError = validateField('bottleName', formData.bottleName);
    const codeError = validateField('code', formData.code);
    const typeError = validateField('printingType', formData.printingType);
    const subError = validateField('printingSubType', formData.printingSubType);

    if (brandError) return Swal.fire('Validation Error', brandError, 'error');
    if (nameError) return Swal.fire('Validation Error', nameError, 'error');
    if (codeError) return Swal.fire('Validation Error', codeError, 'error');
    if (typeError) return Swal.fire('Validation Error', typeError, 'error');
    if (subError) return Swal.fire('Validation Error', subError, 'error');

    dispatch(updateBottleSpec({ id, formData })).then((res) => {
      if (!res.error) {
        Swal.fire('Updated!', 'Bottle specification updated successfully!', 'success');
        navigate('/bottle-specs');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to update spec.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/bottle-specs" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Bottle Specification</h1>
          <p className="page-subtitle">Update technical details for {formData.bottleName}</p>
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
                      Select Brand <span className="text-danger">*</span>
                    </label>
                    <select 
                      className={`form-select custom-input-field ${errors.brandId ? 'is-invalid' : ''}`}
                      name="brandId"
                      required
                      value={formData.brandId} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Brand --</option>
                      {brands.filter(b => b.status || b._id === formData.brandId).map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                    {errors.brandId && <div className="invalid-feedback">{errors.brandId}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottle Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="bottleName"
                      className={`form-control custom-input-field ${errors.bottleName ? 'is-invalid' : ''}`}
                      required
                      value={formData.bottleName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.bottleName && <div className="invalid-feedback">{errors.bottleName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottle Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      className={`form-control custom-input-field ${errors.code ? 'is-invalid' : ''}`}
                      required
                      value={formData.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Printing Type <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="printingType"
                      className={`form-control custom-input-field ${errors.printingType ? 'is-invalid' : ''}`}
                      required
                      value={formData.printingType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.printingType && <div className="invalid-feedback">{errors.printingType}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Subprinting <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="printingSubType"
                      className={`form-control custom-input-field ${errors.printingSubType ? 'is-invalid' : ''}`}
                      required
                      value={formData.printingSubType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.printingSubType && <div className="invalid-feedback">{errors.printingSubType}</div>}
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
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Specification</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/bottle-specs')} className="btn-ghost px-5 py-3">
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
