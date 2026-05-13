import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBrand } from '../redux/slices/brandSlice';
import Swal from 'sweetalert2';

export default function AddBrand() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.brands);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createBrand({ name, status })).then((res) => {
      if (!res.error) {
        Swal.fire('Success!', `Brand "${name}" added successfully!`, 'success');
        navigate('/brands');
      } else {
        Swal.fire('Error!', res.payload || 'Failed to add brand.', 'error');
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
          <h1 className="page-title">Add New Brand</h1>
          <p className="page-subtitle">Define a new brand category</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">Brand Name</label>
                  <input
                    type="text"
                    className="form-control custom-input-field"
                    placeholder="Enter brand name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ borderRadius: 12 }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">Initial Status</label>
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
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Save Brand</>
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
