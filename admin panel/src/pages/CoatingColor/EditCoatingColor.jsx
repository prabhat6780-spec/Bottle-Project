import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoatingColors, updateCoatingColor } from '../../redux/slices/coatingColorSlice';
import { fetchCoatingTypes } from '../../redux/slices/coatingTypeSlice';
import Swal from 'sweetalert2';

export default function EditCoatingColor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.coatingColor);
  const { items: coatingTypes } = useSelector((state) => state.coatingType);

  const [coatingTypeId, setCoatingTypeId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCoatingTypes({ pagination: 'false' }));
    if (items.length === 0) {
      dispatch(fetchCoatingColors({ pagination: 'false' }));
    } else {
      const item = items.find(i => i._id === id);
      if (item) {
        setCoatingTypeId(item.coatingTypeId?._id || item.coatingTypeId || '');
        setName(item.name);
        setStatus(item.status ? 'active' : 'inactive');
      }
    }
  }, [id, items, dispatch]);

  const validateField = (value, fieldLabel) => {
    let msg = '';
    if (!value || value.trim() === '') {
      msg = `${fieldLabel} is mandatory`;
    } else if (coatingTypeId) {
      const isDuplicate = items.some(c =>
        c._id !== id &&
        (c.coatingTypeId?._id === coatingTypeId || c.coatingTypeId === coatingTypeId) &&
        c.name.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (isDuplicate) {
        msg = `${fieldLabel} "${value}" already exists for this coating type`;
      }
    }
    return msg;
  };

  const handleBlur = () => {
    const msg = validateField(name, 'Coating Color Name');
    if (msg) {
      setErrors(prev => ({ ...prev, name: msg }));
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
    const { name: fieldName, value } = e.target;
    if (fieldName === 'name') {
      setName(value);
      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
    } else {
      setCoatingTypeId(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameError = validateField(name, 'Coating Color Name');
    const typeError = !coatingTypeId ? 'Coating Type is mandatory' : '';

    if (nameError || typeError) {
      setErrors({ name: nameError, coatingTypeId: typeError });
      return Swal.fire('Validation Error', nameError || typeError, 'error');
    }

    dispatch(updateCoatingColor({ id, data: { coatingTypeId, name, status } })).then((res) => {
      if (!res.error) {
        Swal.fire('Updated!', 'Coating Color details updated.', 'success');
        navigate('/coating-colors');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to update.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
        <Link to="/coating-colors" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Coating Color</h1>
          <p className="page-subtitle">Modify coating color details</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Coating Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select custom-input-field ${errors.coatingTypeId ? 'is-invalid' : ''}`}
                    name="coatingTypeId"
                    value={coatingTypeId}
                    onChange={handleChange}
                    style={{ borderRadius: 12 }}
                  >
                    <option value="">Select Coating Type</option>
                    {coatingTypes.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  {errors.coatingTypeId && <div className="invalid-feedback">{errors.coatingTypeId}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Coating Color Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control custom-input-field ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    required
                    value={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderRadius: 12 }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">Status</label>
                  <select
                    className="form-select custom-input-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ borderRadius: 12 }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="d-flex gap-2 mt-4 user-form-actions">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Coating Color'}
                  </button>
                  <button type="button" onClick={() => navigate('/coating-colors')} className="btn-ghost px-5 py-3">
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
