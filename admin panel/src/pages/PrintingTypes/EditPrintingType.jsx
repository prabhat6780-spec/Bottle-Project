import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrintingTypes, updatePrintingType } from '../../redux/slices/printingTypeSlice';
import Swal from 'sweetalert2';

export default function EditPrintingType() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.printingType);
  
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchPrintingTypes());
    } else {
      const item = items.find(i => i._id === id);
      if (item) {
        setName(item.name);
        setStatus(item.status ? 'active' : 'inactive');
      }
    }
  }, [id, items, dispatch]);

  const validateField = (value) => {
    let msg = '';
    if (!value || value.trim() === '') {
      msg = 'Printing Type Name is mandatory';
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      msg = 'Printing Type Name should only contain characters';
    } else {
      const isDuplicate = items.some(t => 
        t._id !== id && 
        t.name.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (isDuplicate) {
        msg = `Printing Type "${value}" already exists`;
      }
    }
    setError(msg);
    return msg;
  };

  const handleBlur = () => {
    const msg = validateField(name);
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
    setName(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validateField(name);
    if (msg) return Swal.fire('Validation Error', msg, 'error');

    dispatch(updatePrintingType({ id, data: { name, status } })).then((res) => {
      if (!res.error) {
        Swal.fire('Updated!', 'Printing Type details updated.', 'success');
        navigate('/printing-types');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to update.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
        <Link to="/printing-types" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Printing Type</h1>
          <p className="page-subtitle">Modify printing method details</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Printing Type Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control custom-input-field ${error ? 'is-invalid' : ''}`}
                    required
                    value={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderRadius: 12 }}
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
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
                    {loading ? 'Saving...' : 'Update Printing Type'}
                  </button>
                  <button type="button" onClick={() => navigate('/printing-types')} className="btn-ghost px-5 py-3">
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
