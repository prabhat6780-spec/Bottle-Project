import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateBottleSpec } from '../../redux/slices/bottleSpecSlice';
import Swal from 'sweetalert2';

export default function BottleSpecDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bottleSpecs } = useSelector((state) => state.bottleSpecs);
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    const found = bottleSpecs.find(s => s._id === id);
    if (found) {
      setSpec(found);
    }
  }, [id, bottleSpecs]);

  const toggleStatus = () => {
    const isActive = (spec.status === true || spec.status === 'active' || spec.status === undefined);
    const newStatus = !isActive; // Toggle boolean
    
    Swal.fire({
      title: `Set status to ${newStatus ? 'ACTIVE' : 'INACTIVE'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      confirmButtonColor: newStatus ? '#007236' : '#e91e63'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(updateBottleSpec({ id: spec._id, formData: { status: newStatus } })).then((res) => {
          if (!res.error) {
            Swal.fire('Updated!', `Status is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
          } else {
            Swal.fire('Error!', res.payload || 'Failed to update status.', 'error');
          }
        });
      }
    });
  };

  if (!spec) return <div className="p-5">Loading...</div>;

  const isActive = (spec.status === true || spec.status === 'active' || spec.status === undefined);

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/bottle-specs" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
          </Link>
          <h1 className="page-title mb-0">Bottle Specification Detailed</h1>
        </div>
        <div className="bg-light px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 align-self-start align-self-md-auto" style={{ fontSize: 13, color: '#333' }}>
          <i className="bi bi-calendar-event"></i>
          <span>Date: {spec.createdAt ? new Date(spec.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>

      <div className="dash-card mt-4">
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Bottle Name</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Code</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Printing Type</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Printing Color</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Status</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 fw-600">{spec.bottleName}</td>
                  <td className="px-4 py-4"><code>{spec.code}</code></td>
                  <td className="px-4 py-4">
                    <span className="fw-500">{spec.printingTypeId?.name || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="fw-500">{spec.printingColorId?.name || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge-status badge-${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={toggleStatus}
                      className={`btn ${isActive ? 'btn-danger' : 'btn-success'} btn-sm fw-bold`} 
                      style={{ fontSize: 11 }}
                    >
                      {isActive ? 'MAKE INACTIVE' : 'MAKE ACTIVE'}
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
