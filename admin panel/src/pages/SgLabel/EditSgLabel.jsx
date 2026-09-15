import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchSgLabelById, updateSgLabel, createSgLabel, clearCurrentSgLabel } from '../../redux/slices/sgLabelSlice';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice';
import { fetchVariants } from '../../redux/slices/variantSlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';
import CoatingShadeSelect from '../../components/CoatingShadeSelect';
import CreatableSelect from 'react-select/creatable';
import API from '../../services/api';

const TEXT_COLORS = [
  'Black',
  'White',
  'Gold',
  'Silver',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Not Detected'
];

export default function EditSgLabel() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isVariant = searchParams.get('isVariant') === 'true';

  const [formData, setFormData] = useState({
    bottleId: '',
    coatingShade: '',
    variantId: '',
    detectedTextColor: '',
    customBottleName: '',
    customBrandName: '',
    customVariantName: '',
    status: 'active'
  });

  const { currentSgLabel } = useSelector(state => state.sgLabels);
  const { bottleSpecs } = useSelector(state => state.bottleSpecs);
  const { variants } = useSelector(state => state.variants);
  const { brands } = useSelector(state => state.brands);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bottleMenuOpen, setBottleMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [variantMenuOpen, setVariantMenuOpen] = useState(false);
  const [shadeMenuOpen, setShadeMenuOpen] = useState(false);
  const [textColorMenuOpen, setTextColorMenuOpen] = useState(false);
  const [shades, setShades] = useState([]);

  useEffect(() => {
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
    dispatch(fetchVariants({ pagination: 'false' }));
    dispatch(fetchBrands({ pagination: 'false' }));
    API.get('/bottle-spec/shades').then(res => {
      if (res.data?.success && res.data.data) {
        setShades(res.data.data);
      }
    }).catch(err => console.error(err));
    
    if (isVariant) {
      setInitialLoading(false);
    } else {
      dispatch(fetchSgLabelById(id)).then(() => setInitialLoading(false));
    }

    return () => {
      dispatch(clearCurrentSgLabel());
    };
  }, [dispatch, id, isVariant]);

  useEffect(() => {
    if (currentSgLabel && !isVariant) {
      setFormData({
        bottleId: currentSgLabel.bottleId?._id || '',
        variantId: currentSgLabel.variantId?._id || '',
        customBottleName: currentSgLabel.customBottleName || currentSgLabel.bottleId?.bottleName || '',
        customBrandName: currentSgLabel.customBrandName || currentSgLabel.bottleId?.brandId?.name || '',
        customVariantName: currentSgLabel.customVariantName || currentSgLabel.variantId?.variantName || '',
        coatingShade: currentSgLabel.coatingShade || '',
        detectedTextColor: currentSgLabel.detectedTextColor || '',
        status: currentSgLabel.status !== false ? 'active' : 'inactive'
      });
    } else if (isVariant && bottleSpecs.length > 0 && variants.length > 0) {
      const initBottleId = searchParams.get('bottleId');
      const initVariantId = searchParams.get('variantId');
      const initCoatingShade = searchParams.get('coatingShade');
      const initTextColor = searchParams.get('textColor');
      
      const bottle = bottleSpecs.find(b => b._id === initBottleId);
      const variant = variants.find(v => v._id === initVariantId);
      if (bottle && variant) {
        setFormData(prev => ({
          ...prev,
          bottleId: initBottleId,
          variantId: initVariantId,
          customBottleName: bottle.bottleName,
          customBrandName: bottle.brandId?.name || '',
          customVariantName: variant.variantName,
          coatingShade: initCoatingShade || '',
          detectedTextColor: initTextColor || ''
        }));
      }
    }
  }, [currentSgLabel, isVariant, bottleSpecs, variants, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customBottleName || !formData.coatingShade || !formData.customVariantName) {
      const missing = [];
      if (!formData.customBottleName) missing.push('Bottle Name');
      if (!formData.coatingShade) missing.push('Coating Shade');
      if (!formData.customVariantName) missing.push('Variant Name');
      return Swal.fire('Validation Error', `Please fill in all required fields. Missing: ${missing.join(', ')}`, 'error');
    }

    Swal.fire({
      title: 'Save Changes',
      text: 'Do you want to update this existing custom label, or save it as a brand new entry?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Update Existing',
      denyButtonText: 'Save as New',
      confirmButtonColor: '#007bff',
      denyButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Update Existing
        setLoading(true);
        let res;
        if (isVariant) {
          res = await dispatch(createSgLabel({ ...formData, hideVariant: true }));
        } else {
          res = await dispatch(updateSgLabel({ id, data: formData }));
        }
        setLoading(false);

        if (!res.error) {
          Swal.fire({ icon: 'success', title: 'Success!', text: 'SG Label updated successfully', timer: 1500, showConfirmButton: false });
          navigate('/sg-labels');
        } else {
          Swal.fire('Error', res.payload || 'Failed to update SG Label', 'error');
        }
      } else if (result.isDenied) {
        // Save as New
        setLoading(true);
        let res;
        if (isVariant) {
          res = await dispatch(createSgLabel({ ...formData, hideVariant: false }));
        } else {
          res = await dispatch(createSgLabel(formData));
        }
        setLoading(false);

        if (!res.error) {
          Swal.fire({ icon: 'success', title: 'Success!', text: 'New SG Label created successfully', timer: 1500, showConfirmButton: false });
          navigate('/sg-labels');
        } else {
          Swal.fire('Error', res.payload || 'Failed to create new SG Label', 'error');
        }
      }
    });
  };

  const availableSpecs = bottleSpecs.filter(s => s.status);
  const filteredVariants = variants.filter(v => v.status && (formData.bottleId ? v.bottleSpecId?._id === formData.bottleId : true));

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 user-form-page-header">
        <Link to="/sg-labels" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">SG Label</h1>
          <p className="page-subtitle">Edit</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Bottle Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottle Name <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={formData.customBottleName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matched = availableSpecs.find(s => `${s.bottleName}` === val);
                          if (matched) {
                            setFormData({ ...formData, bottleId: matched._id, customBottleName: val, customBrandName: matched.brandId?.name || formData.customBrandName });
                          } else {
                            setFormData({ ...formData, customBottleName: val });
                          }
                        }}
                        onFocus={() => setBottleMenuOpen(true)}
                        onBlur={() => setTimeout(() => setBottleMenuOpen(false), 200)}
                        placeholder="-- Select or type Bottle Name --"
                        style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px' }}
                      />
                      <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                        ▼
                      </div>
                      {bottleMenuOpen && (
                        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                          {availableSpecs
                            .filter(s => `${s.bottleName}`.toLowerCase().includes((formData.customBottleName || '').toLowerCase()))
                            .map(s => (
                              <div
                                key={s._id}
                                className="p-2 px-3 dropdown-item"
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const val = `${s.bottleName}`;
                                  setFormData({ ...formData, bottleId: s._id, customBottleName: val, customBrandName: s.brandId?.name || formData.customBrandName });
                                  setBottleMenuOpen(false);
                                }}
                              >
                                {s.bottleName} {s.code ? `(${s.code})` : ''}
                              </div>
                            ))}
                          {availableSpecs.filter(s => `${s.bottleName}`.toLowerCase().includes((formData.customBottleName || '').toLowerCase())).length === 0 && (
                            <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Brand Name
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        name="customBrandName"
                        className="form-control shadow-none"
                        value={formData.customBrandName}
                        onChange={handleChange}
                        onFocus={() => setBrandMenuOpen(true)}
                        onBlur={() => setTimeout(() => setBrandMenuOpen(false), 200)}
                        placeholder="-- Select or type Brand Name --"
                        style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px' }}
                      />
                      <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                        ▼
                      </div>
                      {brandMenuOpen && (
                        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                          {brands
                            .filter(b => b.status && b.name.toLowerCase().includes((formData.customBrandName || '').toLowerCase()))
                            .map(b => (
                              <div
                                key={b._id}
                                className="p-2 px-3 dropdown-item"
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData({ ...formData, customBrandName: b.name });
                                  setBrandMenuOpen(false);
                                }}
                              >
                                {b.name}
                              </div>
                            ))}
                          {brands.filter(b => b.status && b.name.toLowerCase().includes((formData.customBrandName || '').toLowerCase())).length === 0 && (
                            <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Variant Name <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={formData.customVariantName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matched = variants.find(v => v.variantName === val);
                          if (matched) {
                            setFormData({
                              ...formData,
                              variantId: matched._id,
                              customVariantName: val,
                              coatingShade: matched?.coatingShade || formData.coatingShade,
                              detectedTextColor: matched?.detectedTextColor || ''
                            });
                          } else {
                            setFormData({ ...formData, customVariantName: val });
                          }
                        }}
                        onFocus={() => setVariantMenuOpen(true)}
                        onBlur={() => setTimeout(() => setVariantMenuOpen(false), 200)}
                        placeholder="-- Select or type Variant --"
                        style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px' }}
                      />
                      <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                        ▼
                      </div>
                      {variantMenuOpen && (
                        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                          {filteredVariants
                            .filter(v => v.variantName.toLowerCase().includes((formData.customVariantName || '').toLowerCase()))
                            .map(v => (
                              <div
                                key={v._id}
                                className="p-2 px-3 dropdown-item"
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData({
                                    ...formData,
                                    variantId: v._id,
                                    customVariantName: v.variantName,
                                    coatingShade: v.coatingShade || formData.coatingShade,
                                    detectedTextColor: v.detectedTextColor || ''
                                  });
                                  setVariantMenuOpen(false);
                                }}
                              >
                                {v.variantName}
                              </div>
                            ))}
                          {filteredVariants.filter(v => v.variantName.toLowerCase().includes((formData.customVariantName || '').toLowerCase())).length === 0 && (
                            <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coating Shade */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Coating Shade <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={formData.coatingShade}
                        onChange={(e) => setFormData({ ...formData, coatingShade: e.target.value })}
                        onFocus={() => setShadeMenuOpen(true)}
                        onBlur={() => setTimeout(() => setShadeMenuOpen(false), 200)}
                        placeholder="-- Select or type Shade --"
                        style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px' }}
                      />
                      <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                        ▼
                      </div>
                      {shadeMenuOpen && (
                        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                          {shades
                            .filter(s => s && s.toLowerCase().includes((formData.coatingShade || '').toLowerCase()))
                            .map(s => (
                              <div
                                key={s}
                                className="p-2 px-3 dropdown-item"
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData({ ...formData, coatingShade: s });
                                  setShadeMenuOpen(false);
                                }}
                              >
                                {s}
                              </div>
                            ))}
                          {shades.filter(s => s && s.toLowerCase().includes((formData.coatingShade || '').toLowerCase())).length === 0 && (
                            <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detected Text Color */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Detected Text Color
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={formData.detectedTextColor}
                        onChange={(e) => setFormData({ ...formData, detectedTextColor: e.target.value })}
                        onFocus={() => setTextColorMenuOpen(true)}
                        onBlur={() => setTimeout(() => setTextColorMenuOpen(false), 200)}
                        placeholder="-- Select or type Text Color --"
                        style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px' }}
                      />
                      <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                        ▼
                      </div>
                      {textColorMenuOpen && (
                        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                          {TEXT_COLORS
                            .filter(c => c.toLowerCase().includes((formData.detectedTextColor || '').toLowerCase()))
                            .map(c => (
                              <div
                                key={c}
                                className="p-2 px-3 dropdown-item"
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData({ ...formData, detectedTextColor: c });
                                  setTextColorMenuOpen(false);
                                }}
                              >
                                {c}
                              </div>
                            ))}
                          {TEXT_COLORS.filter(c => c.toLowerCase().includes((formData.detectedTextColor || '').toLowerCase())).length === 0 && (
                            <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Initial Status */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">Initial Status</label>
                    <select
                      className="form-select custom-input-field shadow-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ borderRadius: '12px', padding: '8px 15px', border: '1px solid #dee2e6' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 mt-5 user-form-actions">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update SG Label</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/sg-labels')} className="btn-ghost px-5 py-3">
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
