import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../redux/slices/bottleSpecSlice';
import { fetchVariants } from '../redux/slices/variantSlice';
import { fetchProductions, updateProduction } from '../redux/slices/productionSlice';
import Swal from 'sweetalert2';

export default function EditProduction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { brands } = useSelector((state) => state.brands);
  const { bottleSpecs: specs } = useSelector((state) => state.bottleSpecs);
  const { variants } = useSelector((state) => state.variants);
  const { productions, loading } = useSelector((state) => state.productions);

  // Calculate min and max dates (Today, Yesterday, Day before yesterday)
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const minDate = twoDaysAgo.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    brandId: '',
    bottleSpecId: '',
    variantId: '',
    date: '',
    totalPrinted: '',
    bottlePerBox: 50,
  });

  const [errors, setErrors] = useState({
    brandId: '',
    bottleSpecId: '',
    variantId: '',
    date: '',
    totalPrinted: '',
    bottlePerBox: ''
  });

  const validateField = (name, value) => {
    let msg = '';
    const fieldNames = {
      brandId: 'Brand',
      bottleSpecId: 'Bottle Spec',
      variantId: 'Variant',
      date: 'Production Date',
      totalPrinted: 'Total Printed',
      bottlePerBox: 'Per Box'
    };

    if (!value) {
      msg = `${fieldNames[name] || name} is mandatory`;
    } else if (['totalPrinted', 'bottlePerBox'].includes(name) && /\s/.test(value.toString())) {
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

    if (['totalPrinted', 'bottlePerBox'].includes(name)) {
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

  const [calc, setCalc] = useState({ boxes: 0, rem: 0 });

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchBottleSpecs());
    dispatch(fetchVariants());
    dispatch(fetchProductions()); // ensure productions are loaded if navigated directly
  }, [dispatch]);

  useEffect(() => {
    const record = productions.find(p => p._id === id);
    if (record) {
      setFormData({
        brandId: record.brandId?._id || record.brandId || '',
        bottleSpecId: record.bottleSpecId?._id || record.bottleSpecId || '',
        variantId: record.variantId?._id || record.variantId || '',
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        totalPrinted: record.totalPrinted || '',
        bottlePerBox: record.bottlePerBox || 50,
      });
    }
  }, [id, productions]);

  // Hierarchical Filtering Logic
  // brandId and bottleSpecId may be populated objects OR plain strings — normalize both sides
  const availableSpecs = specs.filter(s => {
    const sBrandId = (s.brandId?._id || s.brandId)?.toString();
    const isBrandActive = s.brandId?.status !== false;
    return sBrandId === formData.brandId?.toString() && (s.status && isBrandActive || s._id === formData.bottleSpecId);
  });

  const filteredVariants = variants.filter(v => {
    const vSpecId = (v.bottleSpecId?._id || v.bottleSpecId)?.toString();
    const isSpecActive = v.bottleSpecId?.status !== false;
    return vSpecId === formData.bottleSpecId?.toString() && (v.status && isSpecActive || v._id === formData.variantId);
  });

  useEffect(() => {
    const printed = parseInt(formData.totalPrinted) || 0;
    const perBox = parseInt(formData.bottlePerBox) || 1;
    setCalc({
      boxes: Math.floor(printed / perBox),
      rem: printed % perBox
    });
  }, [formData.totalPrinted, formData.bottlePerBox]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const brandError = validateField('brandId', formData.brandId);
    const specError = validateField('bottleSpecId', formData.bottleSpecId);
    const varError = validateField('variantId', formData.variantId);
    const dateError = validateField('date', formData.date);
    const printedError = validateField('totalPrinted', formData.totalPrinted);
    const boxError = validateField('bottlePerBox', formData.bottlePerBox);

    if (brandError) return Swal.fire('Validation Error', brandError, 'error');
    if (specError) return Swal.fire('Validation Error', specError, 'error');
    if (varError) return Swal.fire('Validation Error', varError, 'error');
    if (dateError) return Swal.fire('Validation Error', dateError, 'error');
    if (printedError) return Swal.fire('Validation Error', printedError, 'error');
    if (boxError) return Swal.fire('Validation Error', boxError, 'error');

    dispatch(updateProduction({ id, formData })).then((res) => {
      if (!res.error) {
        Swal.fire('Updated!', 'Production log updated successfully!', 'success');
        navigate('/productions');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to update log.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/productions" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Printing Production Log</h1>
          <p className="page-subtitle">Update details for the selected log</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      1. Brand <span className="text-danger">*</span>
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
                      2. Bottle Spec <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select custom-input-field ${errors.bottleSpecId ? 'is-invalid' : ''}`}
                      name="bottleSpecId"
                      required
                      disabled={!formData.brandId}
                      value={formData.bottleSpecId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Specification --</option>
                      {availableSpecs.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.bottleName} — {s.code} ({s.printingTypeId?.name || 'N/A'} / {s.printingColorId?.name || 'No Color'})
                        </option>
                      ))}
                    </select>
                    {errors.bottleSpecId && <div className="invalid-feedback">{errors.bottleSpecId}</div>}
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      3. Variant <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select custom-input-field ${errors.variantId ? 'is-invalid' : ''}`}
                      name="variantId"
                      required
                      disabled={!formData.bottleSpecId}
                      value={formData.variantId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Variant --</option>
                      {filteredVariants.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.variantName} — {v.variantSize || 'N/A'}
                        </option>
                      ))}
                    </select>
                    {errors.variantId && <div className="invalid-feedback">{errors.variantId}</div>}
                  </div>

                  <hr className="my-4" />

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
                      Total Printed Bottles <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalPrinted"
                      className={`form-control custom-input-field ${errors.totalPrinted ? 'is-invalid' : ''}`}
                      required
                      value={formData.totalPrinted}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.totalPrinted && <div className="invalid-feedback">{errors.totalPrinted}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottles Per Box <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="bottlePerBox"
                      className={`form-control custom-input-field ${errors.bottlePerBox ? 'is-invalid' : ''}`}
                      required
                      value={formData.bottlePerBox}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderRadius: 12 }}
                    />
                    {errors.bottlePerBox && <div className="invalid-feedback">{errors.bottlePerBox}</div>}
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-4 bg-light d-flex justify-content-around text-center border">
                  <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1">Total Boxes</div>
                    <div className="h3 mb-0 text-accent fw-bold">{calc.boxes}</div>
                  </div>
                  <div style={{ width: 1, background: '#dee2e6' }} />
                  <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1">Printed  Remaining Bottles</div>
                    <div className={`h3 mb-0 fw-bold ${calc.rem > 0 ? 'text-danger' : 'text-success'}`}>{calc.rem}</div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Printing Production Log</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/productions')} className="btn-ghost px-5 py-3">
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
