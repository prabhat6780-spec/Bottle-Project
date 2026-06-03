import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateBrand } from '../../redux/slices/brandSlice';
import { fetchCompanies } from '../../redux/slices/companySlice';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';

export default function EditBrand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const { companies = [] } = useSelector((state) => state.companies);
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState({});

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const validateField = (field, value, currentCompanyId = companyId) => {
    let msg = '';
    if (field === 'companyId') {
      if (!value) msg = 'Company is mandatory';
    } else if (field === 'name') {
      if (!value || value.trim() === '') {
        msg = 'Brand Name is mandatory';
      } else if (currentCompanyId) {
        const isDuplicate = brands.some(b => 
          b._id !== id && 
          (b.companyId?._id === currentCompanyId || b.companyId === currentCompanyId) &&
          b.name.toLowerCase().trim() === value.toLowerCase().trim()
        );
        if (isDuplicate) {
          msg = `Brand "${value}" already exists for this company`;
        }
      }
    }
    setError(prev => ({ ...prev, [field]: msg }));
    return msg;
  };

  const handleBlur = (field, value) => {
    const msg = validateField(field, value);
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

  const handleCompanyChange = (value) => {
    setCompanyId(value);
    if (error.companyId) setError(prev => ({ ...prev, companyId: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
      if (error.name) setError(prev => ({ ...prev, name: '' }));
    }
  };

  useEffect(() => {
    const brand = brands.find(b => b._id === id);
    if (brand) {
      setCompanyId(brand.companyId?._id || brand.companyId || '');
      setName(brand.name);
      setStatus(brand.status === true ? 'active' : 'inactive');
    }
  }, [id, brands]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const companyMsg = validateField('companyId', companyId);
    const nameMsg = validateField('name', name);
    if (companyMsg || nameMsg) {
      return Swal.fire('Validation Error', companyMsg || nameMsg, 'error');
    }

    dispatch(updateBrand({ id, formData: { companyId, name, status } })).then((res) => {
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
      <div className="page-header d-flex align-items-center gap-3 brand-form-page-header">
        <Link to="/brands" className="btn-ghost brand-form-back" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div className="min-w-0">
          <h1 className="page-title">Edit Brand</h1>
          <p className="page-subtitle">Update brand details</p>
        </div>
      </div>

      <div className="row justify-content-center g-0 g-sm-3">
        <div className="col-12 col-lg-6">
          <div className="dash-card brand-form-card">
            <div className="dash-card-body p-4 brand-form-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Company <span className="text-danger">*</span>
                  </label>
                  <div className="brand-select-field">
                    <SearchableSelect
                      options={companies.filter(c => c.status || c._id === companyId).map(c => ({ value: c._id, label: c.name }))}
                      value={companyId}
                      onChange={handleCompanyChange}
                      placeholder="-- Choose Company --"
                      isInvalid={!!error.companyId}
                    />
                  </div>
                  {error.companyId && <div className="text-danger" style={{ fontSize: '0.875em', marginTop: 4 }}>{error.companyId}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Brand Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control custom-input-field ${error.name ? 'is-invalid' : ''}`}
                    required
                    value={name}
                    onChange={handleChange}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    style={{ borderRadius: 12 }}
                  />
                  {error.name && <div className="invalid-feedback">{error.name}</div>}
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

                <div className="d-flex gap-2 mt-4 brand-form-actions">
                  <button type="submit" className="btn-accent py-3 flex-grow-1" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check2-circle me-2" /> Update Brand</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate('/brands')} className="btn-ghost py-3">
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
