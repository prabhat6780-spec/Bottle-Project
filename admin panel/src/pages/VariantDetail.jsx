import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateVariant } from '../redux/slices/variantSlice';
import Swal from 'sweetalert2';

export default function VariantDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { variants } = useSelector((state) => state.variants);
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    const found = variants.find(v => v._id === id);
    if (found) {
      setVariant(found);
    }
  }, [id, variants]);

  const toggleStatus = () => {
    const isActive = (variant.status === true || variant.status === 'active' || variant.status === undefined);
    const newStatus = !isActive;
    
    Swal.fire({
      title: `Mark as ${newStatus ? 'ACTIVE' : 'INACTIVE'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#007236' : '#e91e63',
      confirmButtonText: `Yes, make ${newStatus ? 'ACTIVE' : 'INACTIVE'}`
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(updateVariant({ id: variant._id, formData: { status: newStatus } })).then((res) => {
          if (!res.error) {
            Swal.fire('Updated!', `Variant is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
          } else {
            Swal.fire('Error!', res.payload || 'Failed to update status.', 'error');
          }
        });
      }
    });
  };

  if (!variant) return <div className="p-5">Loading...</div>;

  const isActive = (variant.status === true || variant.status === 'active' || variant.status === undefined);

  return (
    <div className="page-content">
      <div className="page-header d-flex align-items-center gap-3">
        <Link to="/variants" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <h1 className="page-title">Variant Detailed</h1>
      </div>

      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="dash-card">
            <div className="dash-card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Variant Name</th>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Product Name</th>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Size</th>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Bottle Spec</th>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Status</th>
                      <th className="px-4 py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: 11 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-4 fw-600">{variant.variantName}</td>
                      <td className="px-4 py-4">
                        {variant.productName} <br/>
                        <small className="text-accent">{variant.bottleSpecId?.brandId?.name || 'N/A'}</small>
                      </td>
                      <td className="px-4 py-4">
                        <span className="badge bg-secondary-subtle text-secondary">{variant.variantSize || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-4">{variant.bottleSpecId?.bottleName || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`badge-status badge-${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button 
                          onClick={toggleStatus}
                          className={`btn ${isActive ? 'btn-danger' : 'btn-success'} btn-sm px-3 py-2 fw-bold text-uppercase`} 
                          style={{ fontSize: 11, borderRadius: 6 }}
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
      </div>
    </div>
  );
}
