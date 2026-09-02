import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {fetchSgLabels, deleteSgLabel, toggleSgLabelStatus} from '../../redux/slices/sgLabelSlice';
import {fetchCompanies} from '../../redux/slices/companySlice';
import {fetchBrands} from '../../redux/slices/brandSlice';
import {fetchBottleSpecs} from '../../redux/slices/bottleSpecSlice';
import { Can } from '../../context/AbilityContext';
import { Dropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import API from '../../services/api';

export default function SgLabels() {
  const dispatch = useDispatch();
  const { sgLabels, loading, total, totalPages, currentPage: reduxPage } = useSelector(state => state.sgLabels);
  const { companies } = useSelector(state => state.companies);
  const { brands } = useSelector(state => state.brands);
  const { bottleSpecs } = useSelector(state => state.bottleSpecs);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = searchParams.get('page') || '';
  const currentPage = parseInt(urlPage || reduxPage || '1', 10);
  const page = currentPage;
  
  const { searchTerm } = useSelector(state => state.sgLabels);
  const search = searchTerm || "";

  const companyId = searchParams.get('companyId') || '';
  const brandId = searchParams.get('brandId') || '';
  const bottleId = searchParams.get('bottleId') || '';
  
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCompanies({ pagination: 'false' }));
    dispatch(fetchBrands({ pagination: 'false' }));
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSgLabels({ page: urlPage, limit: itemsPerPage, search, companyId, brandId, bottleId }));
  }, [dispatch, urlPage, search, companyId, brandId, bottleId]);

  const handlePageChange = (newPage) => {
    const newParams = Object.fromEntries(searchParams);
    newParams.page = newPage;
    setSearchParams(newParams);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteSgLabel(id)).then((res) => {
          if (!res.error) {
            Swal.fire('Deleted!', 'Custom SG Label has been deleted.', 'success');
            dispatch(fetchSgLabels({ page, limit: itemsPerPage, search, companyId, brandId, bottleId }));
          }
        });
      }
    });
  };

  const handleFilterChange = (key, value) => {
    const newParams = Object.fromEntries(searchParams);
    newParams.page = '1';
    if (value) {
      newParams[key] = value;
    } else {
      delete newParams[key];
    }
    
    // Clear dependent filters
    if (key === 'companyId') {
      delete newParams.brandId;
      delete newParams.bottleId;
    }
    if (key === 'brandId') {
      delete newParams.bottleId;
    }
    
    setSearchParams(newParams);
  };

  const handlePrint = (item, type, action) => {
    if (type === 'Printing' && (!item.detectedTextColor || item.detectedTextColor === 'Not Detected')) {
      return Swal.fire('Validation Error', 'Missing Detected Text Color for Printing label', 'error');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isPrint = action === 'print';

    Swal.fire({
      title: isPrint ? 'Print Label Details' : 'Download PDF Details',
      html: `
        <div class="text-start mb-3 mt-3">
          <label class="form-label fw-bold small text-muted">Date <span class="text-danger">*</span></label>
          <input type="date" id="print-date" class="form-control custom-input-field shadow-none" value="${today}" style="border-radius: 10px;" />
        </div>
        <div class="text-start mb-3">
          <div class="form-check form-switch custom-switch-brand d-flex align-items-center gap-2 px-0">
            <input class="form-check-input ms-0" type="checkbox" role="switch" id="include-brand">
            <label class="form-check-label fw-bold small text-muted" for="include-brand">Include Brand Name</label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isPrint ? 'Print' : 'Download PDF',
      confirmButtonColor: isPrint ? '#007bff' : '#28a745',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const date = document.getElementById('print-date').value;
        const includeBrand = document.getElementById('include-brand').checked;
        const qty = '1';
        if (!date) {
          Swal.showValidationMessage('Please enter the date');
          return false;
        }
        return { date, qty, includeBrand };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { date, qty, includeBrand } = result.value;
        const printQty = Number(qty) || 1;

        const dtStr = date ? `${parseInt(date.split('-')[2])}.${parseInt(date.split('-')[1])}.${date.split('-')[0].slice(2)}` : '';
        
        try {
          Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while the PDF is generated.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const response = await API.post('/sg-label/pdf', {
            labelData: item,
            printQty,
            dtStr,
            type,
            includeBrand
          }, {
            responseType: 'blob'
          });

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          Swal.close();

          if (isPrint) {
            // Print flow
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            };
          } else {
            // Download flow
            const link = document.createElement('a');
            link.href = url;
            const bName = (item.customBottleName || item.bottleSpecId?.bottleName || 'bottle').replace(/[\s/\\|:]+/g, '-');
            const cShade = (item.coatingShade || '').replace(/[\s/\\|:]+/g, '-');
            const vName = (item.variantName || '').replace(/[\s/\\|:]+/g, '-');
            const downloadName = `${bName}${cShade ? `-${cShade}` : ''}${vName ? `-${vName}` : ''}.pdf`;
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error("Error generating PDF", error);
          Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
        }
      }
    });
  };

  const activeCompanies = companies?.filter(c => c.status) || [];
  const filteredBrands = brands?.filter(b => b.status && (!companyId || b.companyId?._id === companyId)) || [];
  const filteredBottles = bottleSpecs?.filter(bs => bs.status && (!brandId || bs.brandId?._id === brandId)) || [];

  return (
    <div className="page-content">
      <div className="page-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3 companies-page-header">
        <div>
          <h1 className="page-title mb-1">SG Label</h1>
          <p className="page-subtitle mb-0">Manage Printing and Coating labels</p>
        </div>
        <Can I="create" a="sg-label">
          <Link to="/sg-labels/add" className="btn-accent shadow-sm px-4 py-2 rounded-3 companies-header-action">
            <i className="bi bi-plus-lg me-2"></i> Add Custom SG Label
          </Link>
        </Can>
      </div>

      <div className="dash-card">
        <div className="dash-card-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 border-bottom bg-white companies-dash-toolbar gap-3">
          <div className="d-flex align-items-center gap-2 text-muted small fw-500">
            <span>Show</span>
            <select
              className="form-select form-select-sm shadow-none border-light-subtle bg-light"
              style={{ width: 70, borderRadius: 8, cursor: 'pointer' }}
              value={10}
              readOnly
            >
              <option value="10">10</option>
            </select>
            <span>entries</span>
          </div>



          <div className="search-input-wrapper position-relative companies-search-wrap">
            <i className="bi bi-search text-muted position-absolute top-50 start-0 translate-middle-y ms-3" style={{ pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-light ps-5 py-2 shadow-none"
              placeholder="Search custom labels..."
              value={search}
              onChange={(e) => {
                dispatch(setSearchTerm(e.target.value));
                setSearchParams({ page: 1 });
              }}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        </div>

        {/* ── Mobile list ─────────────────────────────────────────────────────── */}
        <div className="companies-list-mobile d-md-none px-3 py-2">
          {loading ? (
             <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
          ) : sgLabels.length > 0 ? (
            sgLabels.map((item, index) => (
            <div key={item._id} className="companies-mobile-card brands-mobile-card border mb-3 rounded-3 p-3 bg-white shadow-sm">
              <div className="d-flex align-items-start gap-3 w-100 min-w-0">
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-start gap-2 mb-1">
                    <span className="text-muted small fw-bold mt-1">{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                    <span className="fw-semibold" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{item.customBottleName || item.bottleSpecId?.bottleName || 'N/A'}</span>
                  </div>
                  <div className="small text-muted mt-1 fw-bold">
                    Brand: {item.bottleSpecId?.brandId?.name || 'N/A'}
                  </div>
                  <div className="small text-muted mt-1 fw-bold">
                    Variant: {item.variantName || 'N/A'}
                  </div>
                  <div className="small text-muted mt-1">
                    Coating Shade: {item.coatingShade || 'N/A'}
                  </div>
                  <div className="small text-muted mt-1">
                    Text Color: {item.detectedTextColor || 'N/A'}
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  <span className={`badge ${item.isCustom ? 'bg-primary' : 'bg-secondary'} rounded-pill`}>
                    {item.isCustom ? 'Custom Override' : 'Master Variant'}
                  </span>
                  {item.isCustom ? (
                    <span 
                      className={`badge-status badge-${item.status !== false ? 'active' : 'inactive'} mt-2 d-inline-block`}
                      onClick={() => dispatch(toggleSgLabelStatus(item._id))}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      {item.status !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  ) : (
                    <span 
                      className={`badge-status badge-${item.status !== false ? 'active' : 'inactive'} mt-2 d-inline-block opacity-75`}
                      title="Master Variant status is managed in Variants page"
                    >
                      {item.status !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div className="d-flex gap-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm" className="border-0 rounded-3 shadow-none p-2">
                      <i className="bi bi-printer fs-6"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handlePrint(item, 'Printing', 'print')}>Print as Printing</Dropdown.Item>
                      <Dropdown.Item onClick={() => handlePrint(item, 'Coating', 'print')}>Print as Coating</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown>
                    <Dropdown.Toggle variant="outline-success" size="sm" className="border-0 rounded-3 shadow-none p-2">
                      <i className="bi bi-download fs-6"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handlePrint(item, 'Printing', 'download')}>Download as Printing</Dropdown.Item>
                      <Dropdown.Item onClick={() => handlePrint(item, 'Coating', 'download')}>Download as Coating</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="d-flex gap-2">
                  {item.isCustom ? (
                    <>
                      <Can I="edit" a="sg-label">
                        <Link to={`/sg-labels/edit/${item._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                          <i className="bi bi-pencil-square fs-6"></i>
                        </Link>
                      </Can>
                      <Can I="delete" a="sg-label">
                        <button type="button" onClick={() => handleDelete(item._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </Can>
                    </>
                  ) : (
                    <Can I="create" a="sg-label">
                      <Link to={`/sg-labels/add?bottleId=${item.bottleSpecId?._id}&variantId=${item._id}&coatingShade=${encodeURIComponent(item.coatingShade || '')}&textColor=${encodeURIComponent(item.detectedTextColor || '')}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Create Custom Override">
                        <i className="bi bi-pencil-square fs-6"></i>
                      </Link>
                    </Can>
                  )}
                </div>
              </div>
            </div>
          ))) : (
            <div className="companies-mobile-empty text-center py-5 text-muted">No labels found</div>
          )}
        </div>

        {/* ── Desktop table ────────────────────────────────────────────────────── */}
        <div className="table-responsive d-none d-md-block" style={{ overflowX: 'auto' }}>
          <table className="data-table mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 text-uppercase small fw-bold text-muted ps-5 text-start" style={{ width: 100 }}>SR NO</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">BRAND</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">BOTTLE NAME</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">COATING SHADE</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">VARIANT NAME</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">TEXT COLOR</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center">STATUS</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 140 }}>PRINT / DOWNLOAD</th>
                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{ width: 100 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : sgLabels.length > 0 ? (
                sgLabels.map((item, index) => (
                  <tr key={item._id} className="align-middle border-bottom transition-all hover-bg-light">
                    <td className="py-3 ps-5 text-start">
                      <span className="text-muted fw-bold" style={{ fontSize: 13 }}>
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {item.bottleSpecId?.brandId?.name || 'N/A'}
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {item.customBottleName || item.bottleSpecId?.bottleName || 'N/A'}
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {item.coatingShade}
                    </td>
                    <td className="py-3 text-center fw-600 text-dark" style={{ fontSize: 13 }}>
                      {item.variantName || 'N/A'}
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border small">{item.detectedTextColor || 'N/A'}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span 
                        className={`badge-status badge-${item.status !== false ? 'active' : 'inactive'} d-inline-block`}
                        onClick={item.isCustom ? () => dispatch(toggleSgLabelStatus(item._id)) : undefined}
                        style={{ cursor: item.isCustom ? 'pointer' : 'default', opacity: item.isCustom ? 1 : 0.75 }}
                        title={item.isCustom ? "Click to toggle status" : "Master Variant status is managed in Variants page"}
                      >
                        {item.status !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm" className="border-0 rounded-3 shadow-none p-2">
                            <i className="bi bi-printer fs-6"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handlePrint(item, 'Printing', 'print')}>Print as Printing</Dropdown.Item>
                            <Dropdown.Item onClick={() => handlePrint(item, 'Coating', 'print')}>Print as Coating</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                          <Dropdown.Toggle variant="outline-success" size="sm" className="border-0 rounded-3 shadow-none p-2">
                            <i className="bi bi-download fs-6"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handlePrint(item, 'Printing', 'download')}>Download as Printing</Dropdown.Item>
                            <Dropdown.Item onClick={() => handlePrint(item, 'Coating', 'download')}>Download as Coating</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {item.isCustom ? (
                          <>
                            <Can I="edit" a="sg-label">
                              <Link to={`/sg-labels/edit/${item._id}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Edit">
                                <i className="bi bi-pencil-square fs-6" />
                              </Link>
                            </Can>
                            <Can I="delete" a="sg-label">
                              <button type="button" onClick={() => handleDelete(item._id)} className="btn btn-sm btn-outline-danger border-0 rounded-3 shadow-none p-2" title="Delete">
                                <i className="bi bi-trash fs-6" />
                              </button>
                            </Can>
                          </>
                        ) : (
                          <Can I="create" a="sg-label">
                            <Link to={`/sg-labels/add?bottleId=${item.bottleSpecId?._id}&variantId=${item._id}&coatingShade=${encodeURIComponent(item.coatingShade || '')}&textColor=${encodeURIComponent(item.detectedTextColor || '')}`} className="btn btn-sm btn-outline-primary border-0 rounded-3 shadow-none p-2" title="Create Custom Override">
                              <i className="bi bi-pencil-square fs-6"></i>
                            </Link>
                          </Can>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <i className="bi bi-inbox fs-2 text-light-subtle"></i>
                      <span>No SG Labels found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card-footer d-flex align-items-center justify-content-between p-3 border-top bg-white companies-dash-footer">
          <div className="text-muted small fw-500">
            Showing <b>{total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, total)}</b> of <b>{total}</b> entries
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => { if (currentPage > 1) handlePageChange(currentPage - 1); }}
            >
              Previous
            </button>

            {(() => {
              const pages = [];
              const delta = 2;
              const left = currentPage - delta;
              const right = currentPage + delta;
              pages.push(1);
              if (left > 2) pages.push('...');
              for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) pages.push(i);
              if (right < totalPages - 1) pages.push('...');
              if (totalPages > 1) pages.push(totalPages);
              return pages.map((p, idx) =>
                p === '...'
                  ? <span key={`e-${idx}`} className="px-1 text-muted" style={{ fontSize: 13 }}>…</span>
                  : <button key={p} className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-light'}`} onClick={() => handlePageChange(p)}>{p}</button>
              );
            })()}

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => { if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
