import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createRawMaterial } from '../../redux/slices/rawMaterialSlice';
import Swal from 'sweetalert2';

export default function AddRawMaterial() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    status: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return Swal.fire('Validation Error', 'Raw Material Name is required.', 'error');
    }

    setLoading(true);
    const resultAction = await dispatch(createRawMaterial(formData));
    setLoading(false);

    if (createRawMaterial.fulfilled.match(resultAction)) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Raw Material created successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/raw-materials');
    } else {
      Swal.fire('Error', resultAction.payload || 'Failed to create raw material', 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3 user-form-page-header">
        <Link to="/raw-materials" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Add Raw Material</h1>
          <p className="page-subtitle">Create a new raw material record</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="dash-card">
            <div className="dash-card-body p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                
                {/* Name */}
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Material Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control custom-input-field"
                    placeholder="e.g. CLEAR GLOSS"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ borderRadius: 12 }}
                    required
                  />
                </div>

                {/* Status */}
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Initial Status
                  </label>
                  <select
                    className="form-select custom-input-field"
                    value={formData.status ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'active' })}
                    style={{ borderRadius: 12 }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="d-flex gap-2 mt-4 user-form-actions">
                  <button type="submit" className="btn-accent px-5 py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2" />
                        Save Raw Material
                      </>
                    )}
                  </button>
                  <button type="button" className="btn-ghost px-5 py-3" onClick={() => navigate('/raw-materials')} disabled={loading}>
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
