import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice';
import { fetchVariants } from '../../redux/slices/variantSlice';
import { createCoatingProduction } from '../../redux/slices/coatingProductionSlice';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';

export default function AddCoatingProduction() {
  const { unit } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { brands } = useSelector((state) => state.brands);
  const { bottleSpecs: specs } = useSelector((state) => state.bottleSpecs);
  const { variants } = useSelector((state) => state.variants);
  const { loading: saving } = useSelector((state) => state.coatingProductions);

  // Calculate min and max dates (Yesterday, Today, Tomorrow)
  const today = new Date();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const maxDate = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const minDate = yesterday.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    unit,
    brandId: '',
    bottleSpecId: '',
    variantId: '',
    date: new Date().toISOString().split('T')[0],
    operatorName: '',
    actualQuantity: '',
    rejectionQuantity: '',
  });

  const [errors, setErrors] = useState({
    brandId: '',
    bottleSpecId: '',
    variantId: '',
    date: '',
    operatorName: '',
    actualQuantity: '',
    rejectionQuantity: ''
  });

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      brandId: 'Brand',
      bottleSpecId: 'Bottle Spec',
      variantId: 'Variant',
      date: 'Production Date',
      operatorName: 'Operator Name',
      actualQuantity: 'Actual Quantity',
      rejectionQuantity: 'Rejection Quantity'
    };

    if (!value && name !== 'rejectionQuantity') {
      msg = `${fieldNames[name] || name} is mandatory`;
    } else if (['actualQuantity', 'rejectionQuantity'].includes(name) && /\s/.test(value.toString())) {
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
    let cleanValue = value;

    if (['actualQuantity', 'rejectionQuantity'].includes(name)) {
      cleanValue = value.replace(/\s/g, '');
    }

    if (name === 'brandId') {
      setFormData({ ...formData, brandId: cleanValue, bottleSpecId: '', variantId: '' });
    } else if (name === 'bottleSpecId') {
      setFormData({ ...formData, bottleSpecId: cleanValue, variantId: '' });
    } else {
      setFormData({ ...formData, [name]: cleanValue });
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const [calc, setCalc] = useState({ totalActual: 0, total: 0 });

  useEffect(() => {
    dispatch(fetchBrands({ pagination: 'false' }));
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
    dispatch(fetchVariants({ pagination: 'false' }));
  }, [dispatch]);

  // Hierarchical Filtering Logic
  const availableSpecs = specs.filter(s => {
    const sBrandId = (s.brandId?._id || s.brandId)?.toString();
    const isBrandActive = s.brandId?.status !== false; // If brandId is just an ID, we assume true or handle elsewhere
    return sBrandId === formData.brandId?.toString() && s.status && isBrandActive;
  });

  const filteredVariants = variants.filter(v => {
    const vSpecId = (v.bottleSpecId?._id || v.bottleSpecId)?.toString();
    const isSpecActive = v.bottleSpecId?.status !== false;
    return vSpecId === formData.bottleSpecId?.toString() && v.status && isSpecActive;
  });

  useEffect(() => {
    const actual = parseInt(formData.actualQuantity) || 0;
    const rejected = parseInt(formData.rejectionQuantity) || 0;
    setCalc({
      totalActual: actual,
      total: actual + rejected
    });
  }, [formData.actualQuantity, formData.rejectionQuantity]);



  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const brandError = validateField('brandId', formData.brandId);
    const specError = validateField('bottleSpecId', formData.bottleSpecId);
    const varError = validateField('variantId', formData.variantId);
    const dateError = validateField('date', formData.date);
    const printedError = validateField('actualQuantity', formData.actualQuantity);

    if (brandError) return Swal.fire('Validation Error', brandError, 'error');
    if (specError) return Swal.fire('Validation Error', specError, 'error');
    if (varError) return Swal.fire('Validation Error', varError, 'error');
    if (dateError) return Swal.fire('Validation Error', dateError, 'error');
    if (printedError) return Swal.fire('Validation Error', printedError, 'error');

    dispatch(createCoatingProduction({
      ...formData,
      totalActualCoatedBottle: calc.totalActual,
      totalBottleCoated: calc.total
    })).then((res) => {
      if (!res.error) {
        Swal.fire('Success!', `Coating Production log saved!`, 'success');
        navigate(`/coating-productions/unit/${unit}`);
      } else {
        Swal.fire('Error!', res.payload || 'Failed to save log.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center justify-content-between productions-add-header user-form-page-header">
        <div className="d-flex align-items-center gap-3">
          <Link to={`/coating-productions/unit/${unit}`} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
          </Link>
          <div>
            <h1 className="page-title">Add Coating Production - Unit {unit}</h1>
            <p className="page-subtitle">Log new coating production details</p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
            <div className="dash-card border-0 shadow-sm" style={{ borderRadius: 24 }}>
              <div className="dash-card-body p-4 p-md-5">

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        1. Brand <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        options={brands.filter(b => b.status).map(b => ({
                          value: b._id,
                          label: `${b.name}${b.companyId?.name ? ` (${b.companyId.name})` : ''}`
                        }))}
                        value={formData.brandId}
                        onChange={(val) => {
                          setFormData({ ...formData, brandId: val, bottleSpecId: '', variantId: '' });
                          if (errors.brandId) setErrors(prev => ({ ...prev, brandId: '' }));
                        }}
                        placeholder="-- Choose Brand --"
                        isInvalid={!!errors.brandId}
                      />
                      {errors.brandId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{errors.brandId}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        2. Bottle Spec <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        options={availableSpecs.map(s => ({
                          value: s._id,
                          label: `${s.bottleName} — ${s.code} (${s.printingTypeId?.name || 'N/A'} / ${s.printingColorId?.name || 'No Color'})`
                        }))}
                        value={formData.bottleSpecId}
                        onChange={(val) => {
                          setFormData({ ...formData, bottleSpecId: val, variantId: '' });
                          if (errors.bottleSpecId) setErrors(prev => ({ ...prev, bottleSpecId: '' }));
                        }}
                        placeholder="-- Choose Specification --"
                        disabled={!formData.brandId}
                        isInvalid={!!errors.bottleSpecId}
                      />
                      {errors.bottleSpecId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{errors.bottleSpecId}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        3. Variant <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        options={filteredVariants.map(v => ({
                          value: v._id,
                          label: `${v.variantName} — ${v.variantSize || 'N/A'}`
                        }))}
                        value={formData.variantId}
                        onChange={(val) => {
                          setFormData({ ...formData, variantId: val });
                          if (errors.variantId) setErrors(prev => ({ ...prev, variantId: '' }));
                        }}
                        placeholder="-- Choose Variant --"
                        disabled={!formData.bottleSpecId}
                        isInvalid={!!errors.variantId}
                      />
                      {errors.variantId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{errors.variantId}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        Coating Shade
                      </label>
                      <div className="form-control custom-input-field bg-light text-center fw-bold text-dark d-flex align-items-center justify-content-center" style={{ borderRadius: 12 }}>
                        {formData.variantId ? (variants.find(v => v._id === formData.variantId)?.coatingShade || 'N/A') : 'N/A'}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        Operator Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="operatorName"
                        className={`form-control custom-input-field ${errors.operatorName ? 'is-invalid' : ''}`}
                        required
                        value={formData.operatorName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ borderRadius: 12 }}
                      />
                      {errors.operatorName && <div className="invalid-feedback">{errors.operatorName}</div>}
                    </div>

                    <div className="col-12"><hr className="my-4 opacity-50" /></div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        Production Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        className={`form-control custom-input-field ${errors.date ? 'is-invalid' : ''}`}
                        required
                        min={minDate}
                        max={maxDate}
                        value={formData.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ borderRadius: 12 }}
                      />
                      {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        Actual Quantity <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="actualQuantity"
                        className={`form-control custom-input-field ${errors.actualQuantity ? 'is-invalid' : ''}`}
                        required
                        value={formData.actualQuantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ borderRadius: 12 }}
                      />
                      {errors.actualQuantity && <div className="invalid-feedback">{errors.actualQuantity}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-600 small text-uppercase text-muted">
                        Rejection Quantity
                      </label>
                      <input
                        type="number"
                        name="rejectionQuantity"
                        className={`form-control custom-input-field ${errors.rejectionQuantity ? 'is-invalid' : ''}`}
                        value={formData.rejectionQuantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ borderRadius: 12 }}
                      />
                      {errors.rejectionQuantity && <div className="invalid-feedback">{errors.rejectionQuantity}</div>}
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-4 d-flex justify-content-around text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div className="text-muted small text-uppercase fw-bold mb-1">Total Actual</div>
                      <div className="h2 mb-0 text-success fw-bold">{calc.totalActual}</div>
                    </div>
                    <div style={{ width: 1, background: '#cbd5e1' }} />
                    <div>
                      <div className="text-muted small text-uppercase fw-bold mb-1">Total Coated Bottle</div>
                      <div className={`h2 mb-0 fw-bold text-accent`}>{calc.total}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-5 user-form-actions">
                    <button type="submit" className="btn-accent px-5 py-3 flex-grow-1 rounded-4 shadow-sm" disabled={saving}>
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm me-2" /> Saving...</>
                      ) : (
                        <><i className="bi bi-check2-circle me-2" /> Save Entry</>
                      )}
                    </button>
                    <button type="button" onClick={() => navigate(`/coating-productions/unit/${unit}`)} className="btn-ghost px-5 py-3 rounded-4">
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
