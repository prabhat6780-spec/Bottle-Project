import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../../redux/slices/companySlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice';
import { fetchVariants } from '../../redux/slices/variantSlice';
import { fetchCoatingTypes } from '../../redux/slices/coatingTypeSlice';
import { fetchRawMaterials } from '../../redux/slices/rawMaterialSlice';
import { fetchFormulaById, updateFormula } from '../../redux/slices/formulaSlice';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';
import Select from 'react-select';
import { InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap';

export default function EditFormula() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { companies } = useSelector((state) => state.companies);
  const { brands } = useSelector((state) => state.brands);
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const { variants } = useSelector((state) => state.variants);
  const { items: coatingTypes } = useSelector((state) => state.coatingType);
  const { items: rawMaterialsList } = useSelector((state) => state.rawMaterials);
  const { currentFormula, loading: formulaLoading } = useSelector((state) => state.formulas);

  const [formData, setFormData] = useState({
    companyId: '',
    brandId: '',
    bottleIds: [],
    variantIds: [],
    coatingTypeId: '',
    status: 'active',
    columns: [{ columnName: '', rawMaterials: [{ rawMaterialId: '', quantity: '' }] }],
  });

  const [loading, setLoading] = useState(false);
  const [columnMenuOpen, setColumnMenuOpen] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanies({ pagination: 'false' }));
    dispatch(fetchBrands({ pagination: 'false' }));
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
    dispatch(fetchVariants({ pagination: 'false' }));
    dispatch(fetchCoatingTypes({ pagination: 'false' }));
    dispatch(fetchRawMaterials({ pagination: 'false' }));
    
    if (id) {
      dispatch(fetchFormulaById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentFormula && currentFormula._id === id) {
      setFormData({
        companyId: currentFormula.companyId?._id || currentFormula.companyId || '',
        brandId: currentFormula.brandId?._id || currentFormula.brandId || '',
        bottleIds: currentFormula.bottleId ? [currentFormula.bottleId?._id || currentFormula.bottleId] : [],
        variantIds: currentFormula.variantId ? [currentFormula.variantId?._id || currentFormula.variantId] : [],
        coatingTypeId: currentFormula.coatingTypeId?._id || currentFormula.coatingTypeId || '',
        columns: currentFormula.columns && currentFormula.columns.length > 0
                 ? currentFormula.columns.map(col => ({
                     columnName: col.columnName || '',
                     rawMaterials: col.rawMaterials.map(rm => ({
                       rawMaterialId: rm.rawMaterialId?._id || rm.rawMaterialId || '',
                       quantity: rm.quantity || ''
                     }))
                     }))
                 : [{ columnName: '', rawMaterials: [{ rawMaterialId: '', quantity: '' }] }],
        status: currentFormula.status !== false ? 'active' : 'inactive'
      });
      setDataLoaded(true);
    }
  }, [currentFormula, id]);

  const handleSelectChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Cascading resets
      if (field === 'companyId') {
        newData.brandId = '';
        newData.bottleIds = [];
        newData.variantIds = [];
        newData.coatingTypeId = '';
      } else if (field === 'brandId') {
        newData.variantIds = [];
        newData.bottleIds = [];
        newData.coatingTypeId = '';
      } else if (field === 'bottleIds') {
        // no resets needed downwards
      } else if (field === 'variantIds') {
        newData.bottleIds = [];
        newData.coatingTypeId = '';
        if (value && value.length > 0) {
          const selectedVariant = variants.find(v => v._id === value[0]);
          if (selectedVariant && selectedVariant.coatingShade) {
            const s = selectedVariant.coatingShade.toUpperCase();
            let mappedName = null;
            
            if (s.includes('MATT') && (s.includes('TWO TONE') || s.includes('DOUBLE TONE'))) mappedName = 'MATT TWO TONE';
            else if (s.includes('MATT') && (s.includes('TR') || s.includes('TRANSPARENT'))) mappedName = 'MATT TRANSPARENT';
            else if (s.includes('MATT') && (s.includes('OPQ') || s.includes('OPAQUE'))) mappedName = 'MATT OPQUE';
            else if (s.includes('DOUBLE TONE')) mappedName = 'DOUBLE TONE TR';
            else if (s.includes('TR ') || s === 'TR' || s.includes('TRANSPARENT')) mappedName = 'TRANSPARENT';
            else if (s.includes('OPQ') || s.includes('OPAQUE')) mappedName = 'OPAQUE';

            let matchingCoatingType = null;
            if (mappedName) {
              matchingCoatingType = coatingTypes.find(c => c.name.toUpperCase() === mappedName);
            }
            if (!matchingCoatingType) {
              matchingCoatingType = coatingTypes.find(c => 
                c.name.toUpperCase() === s || s.includes(c.name.toUpperCase()) || c.name.toUpperCase().includes(s)
              );
            }

            if (matchingCoatingType) {
              newData.coatingTypeId = matchingCoatingType._id;
            }
          }
        }
      }
      
      return newData;
    });
  };

  const handleAddColumn = () => {
    setFormData(prev => ({
      ...prev,
      columns: [...prev.columns, { columnName: '', rawMaterials: [{ rawMaterialId: '', quantity: '' }] }]
    }));
  };

  const handleColumnNameChange = (boxIndex, value) => {
    setFormData(prev => {
      const newCols = [...prev.columns];
      newCols[boxIndex] = { ...newCols[boxIndex], columnName: value };
      return { ...prev, columns: newCols };
    });
  };

  const handleAddRow = (boxIndex) => {
    setFormData(prev => {
      const newCols = [...prev.columns];
      newCols[boxIndex] = { ...newCols[boxIndex], rawMaterials: [...newCols[boxIndex].rawMaterials, { rawMaterialId: '', quantity: '' }] };
      return { ...prev, columns: newCols };
    });
  };

  const handleRemoveRawMaterial = (boxIndex, rowIndex) => {
    setFormData(prev => {
      const newCols = [...prev.columns];
      const updatedRm = [...newCols[boxIndex].rawMaterials];
      updatedRm.splice(rowIndex, 1);
      
      if (updatedRm.length === 0) {
        newCols.splice(boxIndex, 1);
      } else {
        newCols[boxIndex] = { ...newCols[boxIndex], rawMaterials: updatedRm };
      }
      return { ...prev, columns: newCols };
    });
  };

  const handleRawMaterialChange = (boxIndex, rowIndex, field, value) => {
    setFormData(prev => {
      const newCols = [...prev.columns];
      const updatedRm = [...newCols[boxIndex].rawMaterials];
      updatedRm[rowIndex] = { ...updatedRm[rowIndex], [field]: value };
      newCols[boxIndex] = { ...newCols[boxIndex], rawMaterials: updatedRm };
      return { ...prev, columns: newCols };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyId || !formData.brandId || formData.bottleIds.length === 0 || formData.variantIds.length === 0 || !formData.coatingTypeId) {
      return Swal.fire('Validation Error', 'Please select all fields before saving.', 'error');
    }

    let isValidColumns = true;
    for (let i = 0; i < formData.columns.length; i++) {
      const col = formData.columns[i];
      if (!col.columnName || col.columnName.trim() === '') {
        isValidColumns = false;
        break;
      }
      if (!col.rawMaterials || col.rawMaterials.length === 0) {
        isValidColumns = false;
        break;
      }
      for (let j = 0; j < col.rawMaterials.length; j++) {
        const rm = col.rawMaterials[j];
        if (!rm.rawMaterialId || !rm.quantity || rm.quantity.trim() === '') {
          isValidColumns = false;
          break;
        }
      }
    }

    if (!isValidColumns) {
      return Swal.fire('Validation Error', 'Please fill out all column names and ensure all raw material rows have both a selected material and a quantity.', 'error');
    }

    const payload = {
      ...formData,
      status: formData.status === 'active'
    };

    setLoading(true);
    dispatch(updateFormula({ id, formData: payload })).then((res) => {
      setLoading(false);
      if (!res.error) {
        Swal.fire('Success!', 'Formula updated successfully!', 'success');
        navigate('/formulas');
      } else {
        Swal.fire('Error', res.payload || 'Failed to update formula', 'error');
      }
    });
  };

  const filteredBrands = formData.companyId
    ? brands.filter(b => b.status && (b.companyId?._id === formData.companyId || b.companyId === formData.companyId))
    : [];

  const filteredBottlesForBrand = formData.brandId
    ? bottleSpecs.filter(s => s.status && (s.brandId?._id === formData.brandId || s.brandId === formData.brandId))
    : [];

  const allVariantsForBrand = formData.brandId
    ? variants.filter(v => v.status && filteredBottlesForBrand.some(b => b._id === (v.bottleSpecId?._id || v.bottleSpecId)))
    : [];

  const uniqueVariants = [];
  const seenVariantNames = new Set();
  allVariantsForBrand.forEach(v => {
    const key = `${v.variantName}-${v.variantSize}-${v.coatingShade}`;
    if (!seenVariantNames.has(key)) {
      seenVariantNames.add(key);
      uniqueVariants.push(v);
    }
  });
  const filteredVariants = uniqueVariants;

  const filteredBottles = formData.variantIds && formData.variantIds.length > 0
    ? filteredBottlesForBrand.filter(b => 
        variants.some(v => 
          v.status && 
          (v.bottleSpecId?._id === b._id || v.bottleSpecId === b._id) && 
          formData.variantIds.includes(v._id)
        )
      )
    : [];

  const filteredCoatingTypes = coatingTypes.filter(c => c.status);

  if (formulaLoading && !dataLoaded) {
    return (
      <div className="page-content d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
        <Link to="/formulas" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Formula</h1>
          <p className="page-subtitle">Update combinations of Company, Brand, Bottle Name, and Variant</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Company */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Select Company <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={companies.filter(c => c.status).map(c => ({ value: c._id, label: c.name }))}
                      value={formData.companyId}
                      onChange={(val) => handleSelectChange('companyId', val)}
                      placeholder="-- Choose Company --"
                    />
                  </div>

                  {/* Brand */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Select Brand <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={filteredBrands.map(b => ({ value: b._id, label: b.name }))}
                      value={formData.brandId}
                      onChange={(val) => handleSelectChange('brandId', val)}
                      placeholder="-- Choose Brand --"
                      disabled={!formData.companyId}
                    />
                  </div>

                  {/* Variant */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Select Variant <span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      options={filteredVariants.map(v => ({ value: v._id, label: `${v.variantName} ${v.coatingShade ? `- ${v.coatingShade}` : ''}${v.variantSize ? ` - ${v.variantSize}` : ''}`.trim() }))}
                      value={filteredVariants.filter(v => formData.variantIds.includes(v._id)).map(v => ({ value: v._id, label: `${v.variantName} ${v.coatingShade ? `- ${v.coatingShade}` : ''}${v.variantSize ? ` - ${v.variantSize}` : ''}`.trim() }))}
                      onChange={(selectedOptions) => {
                        const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                        handleSelectChange('variantIds', ids);
                      }}
                      placeholder="-- Choose Variants --"
                      isDisabled={!formData.brandId}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: '12px',
                          borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                          boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
                          padding: '2px',
                          '&:hover': {
                            borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
                          }
                        })
                      }}
                    />
                  </div>

                  {/* Bottle Names */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Bottle Names <span className="text-danger">*</span>
                    </label>
                    <Select
                      isMulti
                      options={filteredBottles.map(s => ({ value: s._id, label: s.bottleName }))}
                      value={filteredBottles.filter(s => formData.bottleIds.includes(s._id)).map(s => ({ value: s._id, label: s.bottleName }))}
                      onChange={(selectedOptions) => {
                        const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                        handleSelectChange('bottleIds', ids);
                      }}
                      placeholder="-- Choose Bottle Names --"
                      isDisabled={formData.variantIds.length === 0}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: '12px',
                          borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                          boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
                          padding: '2px',
                          '&:hover': {
                            borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
                          }
                        })
                      }}
                    />
                  </div>

                  {/* Coating Shade (Read-only) */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Coating Shade
                    </label>
                    <input
                      type="text"
                      className="form-control custom-input-field"
                      style={{ borderRadius: 12, backgroundColor: '#f8f9fa' }}
                      value={formData.variantIds.length > 0 ? variants.find(v => v._id === formData.variantIds[0])?.coatingShade || 'N/A' : 'N/A'}
                      disabled
                    />
                  </div>


                  {/* Coating Type */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Coating Type <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={filteredCoatingTypes.map(c => ({ value: c._id, label: c.name }))}
                      value={formData.coatingTypeId}
                      onChange={(val) => handleSelectChange('coatingTypeId', val)}
                      placeholder="-- Choose Coating Type --"
                      disabled={formData.variantIds.length === 0}
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-6">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Status
                    </label>
                    <select
                      className="form-select shadow-none"
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleSelectChange('status', e.target.value)}
                      style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                </div>

                {formData.companyId && formData.brandId && formData.bottleIds.length > 0 && formData.variantIds.length > 0 && formData.coatingTypeId && (
                  <>
                    <hr className="my-5" />

                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
                  <div>
                    <h5 className="mb-0 fw-bold">
                      {formData.variantIds.length > 0 && variants.find(v => v._id === formData.variantIds[0])?.coatingShade 
                        ? variants.find(v => v._id === formData.variantIds[0])?.coatingShade
                        : 'Raw Materials'}
                    </h5>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" onClick={handleAddColumn} className="btn btn-sm btn-outline-primary fw-600 rounded-3 text-nowrap">
                      <i className="bi bi-plus-lg me-1"></i> Add Column
                    </button>
                  </div>
                </div>

                {formData.columns.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded-3 text-muted small">
                    No columns added. Click "Add Column" to start.
                  </div>
                ) : (
                  <div className="row g-3">
                    {formData.columns.map((box, boxIndex) => {
                      // Get selected variants details
                      const selectedVariantObjs = variants.filter(v => formData.variantIds.includes(v._id));
                      
                      // Combine coating shades into unique options
                      let columnOptions = [];
                      selectedVariantObjs.forEach(v => {
                        if (v.coatingShade) {
                          const parts = v.coatingShade.split(/[\+\/&,]/);
                          parts.forEach(part => {
                            const trimmedPart = part.trim();
                            if (trimmedPart && !columnOptions.includes(trimmedPart)) columnOptions.push(trimmedPart);
                          });
                        }
                      });

                      return (
                        <div className={formData.columns.length === 1 ? "col-12" : "col-12 col-md-6"} key={boxIndex}>
                          <div className="border rounded-3 p-3 bg-white h-100">
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3 w-100">
                              <div className="d-flex align-items-center flex-grow-1 w-100" style={{ maxWidth: '100%' }}>
                                <div className="position-relative w-100">
                                  <input
                                    type="text"
                                    className="form-control shadow-none"
                                    value={box.columnName || ''}
                                    onChange={(e) => handleColumnNameChange(boxIndex, e.target.value)}
                                    onFocus={() => setColumnMenuOpen(prev => ({ ...prev, [boxIndex]: true }))}
                                    onBlur={() => setTimeout(() => setColumnMenuOpen(prev => ({ ...prev, [boxIndex]: false })), 200)}
                                    placeholder="-- Select or type Name --"
                                    style={{ borderRadius: '12px', border: '1px solid #dee2e6', padding: '8px 15px', paddingRight: '35px', textTransform: 'uppercase' }}
                                  />
                                  <div className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
                                    ▼
                                  </div>
                                  {columnMenuOpen[boxIndex] && (
                                    <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px', marginTop: '5px' }}>
                                      {columnOptions
                                        .filter(s => s && s.toLowerCase().includes((box.columnName || '').toLowerCase()))
                                        .map(s => (
                                        <div 
                                          key={s} 
                                          className="p-2 px-3 dropdown-item"
                                          style={{ cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase' }}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleColumnNameChange(boxIndex, s);
                                            setColumnMenuOpen(prev => ({ ...prev, [boxIndex]: false }));
                                          }}
                                        >
                                          {s}
                                        </div>
                                      ))}
                                      {columnOptions.filter(s => s && s.toLowerCase().includes((box.columnName || '').toLowerCase())).length === 0 && (
                                        <div className="p-2 px-3 text-muted" style={{ fontSize: '14px' }}>No matches</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button type="button" onClick={() => handleAddRow(boxIndex)} className="btn btn-sm btn-outline-primary fw-600 rounded-3 text-nowrap">
                                <i className="bi bi-plus-lg me-1"></i> Add Row
                              </button>
                            </div>
                            <div className="table-responsive" style={{ paddingBottom: '120px' }}>
                              <table className="table table-borderless align-middle mb-0" style={{ minWidth: '400px' }}>
                              <thead className="bg-light">
                                <tr>
                                  <th className="small text-uppercase fw-600 text-muted rounded-start" style={{ width: '50%' }}>Raw Material</th>
                                  <th className="small text-uppercase fw-600 text-muted" style={{ width: '40%' }}>Quantity</th>
                                  <th className="small text-uppercase fw-600 text-muted rounded-end text-end" style={{ width: '10%' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {box.rawMaterials.map((rm, rowIndex) => (
                                  <tr key={rowIndex} className="border-bottom">
                                    <td className="py-3 px-0 pe-2">
                                      <SearchableSelect
                                        options={(rawMaterialsList || []).filter(r => r.status).map(r => ({ value: r._id, label: r.name }))}
                                        value={rm.rawMaterialId}
                                        onChange={(val) => handleRawMaterialChange(boxIndex, rowIndex, 'rawMaterialId', val)}
                                        placeholder="Select Material"
                                      />
                                    </td>
                                    <td className="py-3 px-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. 50g or 20%"
                                        value={rm.quantity}
                                        onChange={(e) => handleRawMaterialChange(boxIndex, rowIndex, 'quantity', e.target.value)}
                                        style={{ borderRadius: '8px' }}
                                      />
                                    </td>
                                    <td className="py-3 px-0 text-end">
                                      <button type="button" onClick={() => handleRemoveRawMaterial(boxIndex, rowIndex)} className="btn btn-sm btn-outline-danger border-0 shadow-none">
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                  </>
                )}

                <div className="d-flex flex-column flex-md-row gap-2 mt-5 user-form-actions">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Formula</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/formulas')} className="btn-ghost px-5 py-3">
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
