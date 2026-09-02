import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRawMaterialById, updateRawMaterial } from '../../redux/slices/rawMaterialSlice';
import Swal from 'sweetalert2';

export default function ViewRawMaterial() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentMaterial, loading } = useSelector((state) => state.rawMaterials);

  useEffect(() => {
    if (id) {
      dispatch(fetchRawMaterialById(id));
    }
  }, [dispatch, id]);

  const handleToggleStatus = async () => {
    const newStatus = !currentMaterial.status;
    const actionText = newStatus ? 'Activate' : 'Deactivate';
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${actionText.toLowerCase()} this raw material?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#10b981' : '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, ${actionText} it!`
    });

    if (result.isConfirmed) {
      const response = await dispatch(updateRawMaterial({ id, data: { ...currentMaterial, status: newStatus } }));
      if (!response.error) {
        Swal.fire('Updated!', `Raw Material has been ${newStatus ? 'activated' : 'deactivated'}.`, 'success');
        dispatch(fetchRawMaterialById(id));
      } else {
        Swal.fire('Error', response.payload || 'Failed to update status', 'error');
      }
    }
  };

  if (loading || !currentMaterial || currentMaterial._id !== id) {
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
          <h1 className="page-title">View Raw Material</h1>
          <p className="page-subtitle">Details of selected raw material</p>
        </div>
      </div>

      <div className="dash-card mt-4">
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Raw Material Name</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Status</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 fw-600">{currentMaterial.name}</td>
                  <td className="px-4 py-4">
                    <span className={`badge-status badge-${currentMaterial.status ? 'active' : 'inactive'}`}>
                      {currentMaterial.status ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={handleToggleStatus}
                      className={`btn ${currentMaterial.status ? 'btn-danger' : 'btn-success'} btn-sm fw-bold`} 
                      style={{ fontSize: 11 }}
                    >
                      {currentMaterial.status ? 'MAKE INACTIVE' : 'MAKE ACTIVE'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
