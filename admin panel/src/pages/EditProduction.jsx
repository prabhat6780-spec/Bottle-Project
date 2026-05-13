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

  const [formData, setFormData] = useState({
    brandId: '',
    bottleSpecId: '',
    variantId: '',
    date: '',
    totalPrinted: '',
    bottlePerBox: 50,
  });

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
          <h1 className="page-title">Edit Production Log</h1>
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
                    <label className="form-label fw-600 small text-uppercase text-muted">1. Brand</label>
                    <select 
                      className="form-select custom-input-field" 
                      required
                      value={formData.brandId} 
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value, bottleSpecId: '', variantId: '' })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Brand --</option>
                      {brands.filter(b => b.status || b._id === formData.brandId).map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">2. Bottle Spec</label>
                    <select 
                      className="form-select custom-input-field" 
                      required
                      disabled={!formData.brandId}
                      value={formData.bottleSpecId} 
                      onChange={(e) => setFormData({ ...formData, bottleSpecId: e.target.value, variantId: '' })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Specification --</option>
                      {availableSpecs.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.bottleName} — {s.code} ({s.printingType} / {s.printingSubType || 'No Subprinting'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-600 small text-uppercase text-muted">3. Variant</label>
                    <select 
                      className="form-select custom-input-field" 
                      required
                      disabled={!formData.bottleSpecId}
                      value={formData.variantId} 
                      onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                      style={{ borderRadius: 12 }}
                    >
                      <option value="">-- Choose Variant --</option>
                      {filteredVariants.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.variantName} — {v.variantType} — {v.variantSize}
                        </option>
                      ))}
                    </select>
                  </div>

                  <hr className="my-4" />

                  <div className="col-md-4">
                    <label className="form-label fw-600 small text-uppercase text-muted">Production Date</label>
                    <input
                      type="date"
                      className="form-control custom-input-field"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-600 small text-uppercase text-muted">Total Printed Bottles</label>
                    <input
                      type="number"
                      className="form-control custom-input-field"
                      required
                      value={formData.totalPrinted}
                      onChange={(e) => setFormData({ ...formData, totalPrinted: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-600 small text-uppercase text-muted">Bottles Per Box</label>
                    <input
                      type="number"
                      className="form-control custom-input-field"
                      required
                      value={formData.bottlePerBox}
                      onChange={(e) => setFormData({ ...formData, bottlePerBox: e.target.value })}
                      style={{ borderRadius: 12 }}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-4 bg-light d-flex justify-content-around text-center border">
                  <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1">Total Boxes</div>
                    <div className="h3 mb-0 text-accent fw-bold">{calc.boxes}</div>
                  </div>
                  <div style={{ width: 1, background: '#dee2e6' }} />
                  <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1">Remaining Bottles</div>
                    <div className={`h3 mb-0 fw-bold ${calc.rem > 0 ? 'text-danger' : 'text-success'}`}>{calc.rem}</div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Production Log</>
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
