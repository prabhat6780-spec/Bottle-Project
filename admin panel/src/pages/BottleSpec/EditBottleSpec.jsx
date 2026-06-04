import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateBottleSpec } from '../../redux/slices/bottleSpecSlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchCompanies } from '../../redux/slices/companySlice';
import { fetchPrintingTypes } from '../../redux/slices/printingTypeSlice';
import { fetchPrintingColors } from '../../redux/slices/printingColorSlice';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';

export default function EditBottleSpec() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bottleSpecs, loading } = useSelector((state) => state.bottleSpecs);
  const { brands } = useSelector((state) => state.brands);
  const { companies } = useSelector((state) => state.companies);
  const { items: printingTypes } = useSelector((state) => state.printingType);
  const { items: printingColors } = useSelector((state) => state.printingColor);

  const [formData, setFormData] = useState({
    companyId: '',
    brandId: '',
    bottleName: '',
    code: '',
    printingTypeId: '',
    printingColorId: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({
    companyId: '',
    brandId: '',
    bottleName: '',
    printingTypeId: ''
  });

  const [filteredColors, setFilteredColors] = useState([]);

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchBrands());
    dispatch(fetchPrintingTypes());
    dispatch(fetchPrintingColors());
  }, [dispatch]);

  useEffect(() => {
    const spec = bottleSpecs.find(s => s._id === id);
    if (spec) {
      setFormData({
        companyId: spec.brandId?.companyId?._id || spec.brandId?.companyId || '',
        brandId: spec.brandId?._id || spec.brandId || '',
        bottleName: spec.bottleName || '',
        code: spec.code || '',
        printingTypeId: spec.printingTypeId?._id || spec.printingTypeId || '',
        printingColorId: spec.printingColorId?._id || spec.printingColorId || '',
        status: spec.status === true ? 'active' : 'inactive'
      });
    }
  }, [id, bottleSpecs]);

  useEffect(() => {
    if (formData.printingTypeId) {
      const filtered = printingColors.filter(c => c.printingTypeId?._id === formData.printingTypeId || c.printingTypeId === formData.printingTypeId);
      setFilteredColors(filtered);
    } else {
      setFilteredColors([]);
    }
  }, [formData.printingTypeId, printingColors]);

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      companyId: 'Company',
      brandId: 'Brand',
      bottleName: 'Bottle Name',
      printingTypeId: 'Printing Type'
    };

    if (!value) {
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

  const handleSelectChange = (field, value) => {
    if (field === 'companyId') {
      setFormData(prev => ({ ...prev, companyId: value, brandId: '' }));
    } else if (field === 'printingTypeId') {
      setFormData(prev => ({ ...prev, printingTypeId: value, printingColorId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'companyId') {
      setFormData(prev => ({ ...prev, companyId: value, brandId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'printingTypeId') {
      setFormData(prev => ({ ...prev, printingColorId: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const companyError = validateField('companyId', formData.companyId);
    const brandError = validateField('brandId', formData.brandId);
    const nameError = validateField('bottleName', formData.bottleName);
    const typeError = validateField('printingTypeId', formData.printingTypeId);

    if (companyError || brandError || nameError || typeError) {
      return Swal.fire('Validation Error', 'Please fix errors before submitting.', 'error');
    }

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
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
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
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Select Company <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={companies.filter(c => c.status || c._id === formData.companyId).map(c => ({ value: c._id, label: c.name }))}
                      value={formData.companyId}
                      onChange={(val) => handleSelectChange('companyId', val)}
                      placeholder="-- Choose Company --"
                      isInvalid={!!errors.companyId}
                    />
                    {errors.companyId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{errors.companyId}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Select Brand <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={brands.filter(b => (b.status || b._id === formData.brandId) && (b.companyId?._id === formData.companyId || b.companyId === formData.companyId)).map(b => ({ value: b._id, label: b.name }))}
                      value={formData.brandId}
                      onChange={(val) => handleSelectChange('brandId', val)}
                      placeholder="-- Choose Brand --"
                      disabled={!formData.companyId}
                      isInvalid={!!errors.brandId}
                    />
                    {errors.brandId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{errors.brandId}</div>}
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
                      Bottle Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      className="form-control custom-input-field"
                      value={formData.code}
                      onChange={handleChange}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Printing Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select custom-input-field ${errors.printingTypeId ? 'is-invalid' : ''}`}
                      name="printingTypeId"
                      required
                      value={formData.printingTypeId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">Select Printing Type</option>
                      {printingTypes.filter(t => t.status || t._id === formData.printingTypeId).map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                    {errors.printingTypeId && <div className="invalid-feedback">{errors.printingTypeId}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Printing Color
                    </label>
                    <select
                      className="form-select custom-input-field"
                      name="printingColorId"
                      disabled={!formData.printingTypeId}
                      value={formData.printingColorId}
                      onChange={handleChange}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">Select Color</option>
                      {filteredColors.filter(c => c.status || c._id === formData.printingColorId).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
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

                <div className="d-flex flex-column flex-md-row gap-2 mt-5 user-form-actions">
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
