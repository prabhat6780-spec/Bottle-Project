import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateBrand } from '../redux/slices/brandSlice';
import Swal from 'sweetalert2';

export default function EditBrand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');

  const validateField = (value) => {
    let msg = '';
    if (!value || value.trim() === '') {
      msg = 'Brand Name is mandatory';
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      msg = 'Brand Name should only contain characters';
    } else {
      const isDuplicate = brands.some(b => 
        b._id !== id && 
        b.name.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (isDuplicate) {
        msg = `Brand "${value}" already exists`;
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

  useEffect(() => {
    const brand = brands.find(b => b._id === id);
    if (brand) {
      setName(brand.name);
      setStatus(brand.status === true ? 'active' : 'inactive');
    }
  }, [id, brands]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validateField(name);
    if (msg) {
      return Swal.fire('Validation Error', msg, 'error');
    }

    dispatch(updateBrand({ id, formData: { name, status } })).then((res) => {
      if (!res.error) {
        Swal.fire('Updated!', 'Brand updated successfully!', 'success');
        navigate('/brands');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to update brand.', 'error');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/brands" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Brand</h1>
          <p className="page-subtitle">Update brand details</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Brand Name <span className="text-danger">*</span>
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

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Brand</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/brands')} className="btn-ghost px-5 py-3">
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
