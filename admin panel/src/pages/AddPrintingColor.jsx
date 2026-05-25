import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPrintingColor, fetchPrintingColors } from '../redux/slices/printingColorSlice';
import { fetchPrintingTypes } from '../redux/slices/printingTypeSlice';
import Swal from 'sweetalert2';

export default function AddPrintingColor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: printingColors = [], loading } = useSelector((state) => state.printingColor);
  const { items: printingTypes = [] } = useSelector((state) => state.printingType);
  
  const [printingTypeId, setPrintingTypeId] = useState('');
  const [colorRows, setColorRows] = useState([{ name: '', status: 'active' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchPrintingTypes());
    dispatch(fetchPrintingColors());
  }, [dispatch]);

  const handleAddMore = () => {
    setColorRows([...colorRows, { name: '', status: 'active' }]);
  };

  const handleRemoveRow = (index) => {
    if (colorRows.length > 1) {
      const newRows = colorRows.filter((_, i) => i !== index);
      setColorRows(newRows);
      // Clean up errors for removed row
      const newErrors = { ...errors };
      delete newErrors[`name_${index}`];
      setErrors(newErrors);
    }
  };

  const validateField = (value, fieldLabel) => {
    let msg = '';
    if (!value || value.trim() === '') {
      msg = `${fieldLabel} is mandatory`;
    } else if (/\s/.test(value)) {
      msg = 'Whitespace is not allowed';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      msg = `${fieldLabel} should only contain characters, numbers, underscores, or hyphens`;
    } else if (printingTypeId) {
      const isDuplicate = printingColors.some(c => 
        (c.printingTypeId?._id === printingTypeId || c.printingTypeId === printingTypeId) &&
        c.name.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (isDuplicate) {
        msg = `${fieldLabel} "${value}" already exists for this printing type`;
      }
    }
    return msg;
  };

  const handleRowChange = (index, field, value) => {
    const cleanValue = field === 'name' ? value.replace(/\s/g, '') : value;
    const newRows = [...colorRows];
    newRows[index][field] = cleanValue;
    setColorRows(newRows);
    if (errors[`name_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`name_${index}`];
      setErrors(newErrors);
    }
  };

  const handleBlur = (index) => {
    const msg = validateField(colorRows[index].name, 'Color Name');
    if (msg) {
      setErrors(prev => ({ ...prev, [`name_${index}`]: msg }));
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

  const validate = () => {
    let newErrors = {};
    if (!printingTypeId) newErrors.printingTypeId = 'Printing Type is mandatory';
    
    colorRows.forEach((row, index) => {
      const msg = validateField(row.name, 'Color Name');
      if (msg) {
        newErrors[`name_${index}`] = msg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return Swal.fire('Validation Error', 'Please fix all errors before saving.', 'error');
    }

    const payload = colorRows.map(row => ({
      printingTypeId,
      name: row.name,
      status: row.status
    }));

    dispatch(createPrintingColor(payload)).then((res) => {
      if (!res.error) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${colorRows.length} Color(s) added successfully!`,
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/printing-colors');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to add printing color.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/printing-colors" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Add Printing Colors</h1>
          <p className="page-subtitle">Define one or more colors for a printing method</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4 col-lg-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Printing Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select custom-input-field ${errors.printingTypeId ? 'is-invalid' : ''}`}
                    value={printingTypeId}
                    onChange={(e) => setPrintingTypeId(e.target.value)}
                    style={{ borderRadius: 12 }}
                  >
                    <option value="">Select Printing Type</option>
                    {printingTypes.filter(t => t.status).map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  {errors.printingTypeId && <div className="invalid-feedback">{errors.printingTypeId}</div>}
                </div>

                <hr className="my-4 text-muted opacity-25" />

                <div className="mb-3">
                  <label className="form-label fw-600 small text-uppercase text-muted d-block">Color Definitions</label>
                  {colorRows.map((row, index) => (
                    <div key={index} className="row g-3 mb-3 align-items-end">
                      <div className="col-md-5">
                        <label className="form-label small text-muted">Color Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control custom-input-field ${errors[`name_${index}`] ? 'is-invalid' : ''}`}
                          placeholder="e.g. Red, Blue"
                          value={row.name}
                          onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                          onBlur={() => handleBlur(index)}
                          style={{ borderRadius: 12 }}
                        />
                        {errors[`name_${index}`] && <div className="invalid-feedback">{errors[`name_${index}`]}</div>}
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small text-muted">Status</label>
                        <select
                          className="form-select custom-input-field"
                          value={row.status}
                          onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                          style={{ borderRadius: 12 }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        {colorRows.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveRow(index)} 
                            className="btn btn-outline-danger w-100 border-0 shadow-none"
                            style={{ height: '48px', borderRadius: 12 }}
                          >
                            <i className="bi bi-trash-fill" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <button 
                    type="button" 
                    onClick={handleAddMore} 
                    className="btn btn-outline-primary border-dashed w-100 py-3"
                    style={{ borderRadius: 12, borderStyle: 'dashed' }}
                  >
                    <i className="bi bi-plus-circle-fill me-2" /> Add More Color
                  </button>
                </div>

                <div className="d-flex gap-2 mt-5">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Save & Back</>
                    )}
                  </button>

                  <button type="button" onClick={() => navigate('/printing-colors')} className="btn-ghost px-5 py-3">
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
