import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFormulaById } from '../../redux/slices/formulaSlice';
import { V_URL } from '../../../Baseurl.js';

export default function ViewFormula() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { currentFormula, loading } = useSelector((state) => state.formulas);

  useEffect(() => {
    if (id) {
      dispatch(fetchFormulaById(id));
    }
  }, [dispatch, id]);

  if (loading || !currentFormula || currentFormula._id !== id) {
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
        <Link to="/formulas" className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-arrow-left" style={{ fontSize: 20 }} />
        </Link>
        <div>
          <h1 className="page-title">View Formula</h1>
          <p className="page-subtitle">Details of selected formula</p>
        </div>
      </div>

      <div className="row justify-content-center g-4">
        {/* Left Side: Variant Image Box */}
        <div className="col-lg-4">
          <div className="dash-card h-100">
            <div className="dash-card-body p-4 d-flex flex-column align-items-center justify-content-center h-100">
              {currentFormula.variantId?.image ? (
                <img 
                  src={`${V_URL}${currentFormula.variantId.image.startsWith('/') ? '' : '/'}${currentFormula.variantId.image}`} 
                  alt="Variant Image" 
                  style={{ width: '100%', maxWidth: '280px', height: 'auto', borderRadius: '12px', objectFit: 'cover' }} 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23f8f9fa%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212px%22%20fill%3D%22%236c757d%22%3ENA%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                />
              ) : (
                <div className="bg-light rounded d-flex flex-column align-items-center justify-content-center" style={{ width: '100%', maxWidth: '280px', height: '280px' }}>
                  <i className="bi bi-image text-muted" style={{ fontSize: '4rem' }}></i>
                  <span className="text-muted mt-2">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Details Box */}
        <div className="col-lg-8">
          <div className="dash-card">
            <div className="dash-card-body p-4">
              <div className="row g-4">
                {/* Company */}
                <div className="col-md-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Company
                  </label>
                  <div className="form-control bg-light h-auto min-vh-25">
                    {currentFormula.companyId?.name || 'N/A'}
                  </div>
                </div>

                {/* Brand */}
                <div className="col-md-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Brand
                  </label>
                  <div className="form-control bg-light h-auto min-vh-25">
                    {currentFormula.brandId?.name || 'N/A'}
                  </div>
                </div>

                {/* Bottle Name */}
                <div className="col-md-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Bottle Name
                  </label>
                  <div className="form-control bg-light h-auto min-vh-25">
                    {currentFormula.bottleId?.bottleName || 'N/A'}
                  </div>
                </div>

                {/* Variant */}
                <div className="col-md-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Variant
                  </label>
                  <div className="form-control bg-light h-auto min-vh-25">
                    {typeof currentFormula.variantId === 'object' ? `${currentFormula.variantId.variantName} ${currentFormula.variantId.coatingShade ? `- ${currentFormula.variantId.coatingShade}` : ''}${currentFormula.variantId.variantSize ? ` - ${currentFormula.variantId.variantSize}` : ''}`.trim() : 'N/A'}
                  </div>
                </div>

                {/* Coating Type */}
                <div className="col-md-6">
                  <label className="form-label fw-600 small text-uppercase text-muted">
                    Coating Type
                  </label>
                  <div className="form-control bg-light">
                    {typeof currentFormula.coatingTypeId === 'object' ? (currentFormula.coatingTypeId.name || 'N/A') : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Recipe Table Layout */}
              <div className="mt-5 d-flex justify-content-center">
                {currentFormula.columns && currentFormula.columns.length > 0 ? (
                  (() => {
                    const columnsCount = currentFormula.columns.length;
                    const maxRows = Math.max(...currentFormula.columns.map(c => c.rawMaterials?.length || 0));
                    
                    return (
                      <div className="table-responsive w-100 d-flex justify-content-center">
                        <table className="table text-center align-middle" style={{ width: 'auto', border: '2px solid #000', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th colSpan={columnsCount * 2} className="py-2" style={{ fontSize: '22px', fontWeight: '800', border: '2px solid #000', backgroundColor: '#e9ece0', color: '#000' }}>
                                {currentFormula.bottleId?.bottleName?.toUpperCase() || 'N/A'}
                              </th>
                            </tr>
                            <tr>
                              <th colSpan={columnsCount * 2} className="py-2" style={{ fontSize: '18px', fontWeight: '700', border: '2px solid #000', backgroundColor: '#fff', color: '#000' }}>
                                {currentFormula.variantId?.variantName?.toUpperCase() || 'N/A'}
                              </th>
                            </tr>
                            <tr>
                              {currentFormula.columns.map((col, colIdx) => (
                                <th key={colIdx} colSpan="2" className="py-2" style={{ fontSize: '18px', fontWeight: '700', border: '2px solid #000', backgroundColor: '#fff', color: '#000' }}>
                                  {col.columnName ? col.columnName.toUpperCase() : (currentFormula.variantId?.coatingShade?.toUpperCase() || 'N/A')}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {maxRows > 0 ? (
                              Array.from({ length: maxRows }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                  {currentFormula.columns.map((col, colIdx) => {
                                    const rm = col.rawMaterials && col.rawMaterials[rowIndex] ? col.rawMaterials[rowIndex] : null;
                                    return (
                                      <React.Fragment key={colIdx}>
                                        <td className="py-2 fw-bold" style={{ width: '150px', border: '2px solid #000', fontSize: '16px', color: '#000' }}>
                                          {rm?.rawMaterialId?.name?.toUpperCase() || ''}
                                        </td>
                                        <td className="py-2 fw-bold text-start ps-3" style={{ width: '150px', border: '2px solid #000', fontSize: '16px', color: '#000' }}>
                                          {rm?.quantity?.toUpperCase() || ''}
                                        </td>
                                      </React.Fragment>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={columnsCount * 2} className="py-3 text-muted" style={{ border: '2px solid #000' }}>
                                  No raw materials added.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-4 bg-light rounded-3 text-muted small w-100">
                    No formula columns added.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
