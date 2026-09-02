import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRawMaterialById, updateRawMaterial } from '../../redux/slices/rawMaterialSlice';
import Swal from 'sweetalert2';

export default function EditRawMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentMaterial, loading: fetchLoading } = useSelector((state) => state.rawMaterials);
  
  const [formData, setFormData] = useState({
    name: '',
    status: true,
  });

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchRawMaterialById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentMaterial && currentMaterial._id === id) {
      setFormData({
        name: currentMaterial.name || '',
        status: currentMaterial.status !== undefined ? currentMaterial.status : true,
      });
      setDataLoaded(true);
    }
  }, [currentMaterial, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return Swal.fire('Validation Error', 'Raw Material Name is required.', 'error');
    }

    setLoading(true);
    const resultAction = await dispatch(updateRawMaterial({ id, data: formData }));
    setLoading(false);

    if (updateRawMaterial.fulfilled.match(resultAction)) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Raw Material updated successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/raw-materials');
    } else {
      Swal.fire('Error', resultAction.payload || 'Failed to update raw material', 'error');
    }
  };

  if (fetchLoading && !dataLoaded) {
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
        <Link to="/raw-materials" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">Edit Raw Material</h1>
          <p className="page-subtitle">Update raw material record</p>
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2" />
                        Update Raw Material
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
