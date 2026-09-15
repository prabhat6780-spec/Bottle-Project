import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { createTemplate, updateTemplate, fetchTemplate } from '../../redux/slices/sgLabelTwoSlice';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { fetchBottleSpecs } from '../../redux/slices/bottleSpecSlice';
import { fetchVariants } from '../../redux/slices/variantSlice';
import Swal from 'sweetalert2';

// Basic standard variables available for stickers
const AVAILABLE_VARIABLES = [
  { key: '{{date}}', label: 'Current Date' }
];

// Custom inline dropdown component similar to SgLabel
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // If the value is a template placeholder like {{bottleName}}, don't filter by it.
  const filterText = (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) 
    ? '' 
    : (value || '').toLowerCase();

  const validOptions = (options || []).filter(o => o !== null && o !== undefined).map(o => String(o));

  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control shadow-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setMenuOpen(true)}
        onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
        placeholder={placeholder}
        style={{ borderRadius: '6px', border: '1px solid #dee2e6', padding: '4px 8px', paddingRight: '25px', fontSize: '13px' }}
      />
      <div className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a0a5ab', fontSize: '10px' }}>
        ▼
      </div>
      {menuOpen && (
        <div className="position-absolute w-100 shadow-sm bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', borderRadius: '6px', marginTop: '5px' }}>
          {validOptions
            .filter(o => o.toLowerCase().includes(filterText))
            .map((o, idx) => (
            <div 
              key={idx} 
              className="p-2 px-3 dropdown-item"
              style={{ cursor: 'pointer', fontSize: '13px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o);
                setMenuOpen(false);
              }}
            >
              {o}
            </div>
          ))}
          {validOptions.filter(o => o.toLowerCase().includes(filterText)).length === 0 && (
            <div className="p-2 px-3 text-muted" style={{ fontSize: '13px' }}>No matches</div>
          )}
        </div>
      )}
    </div>
  );
};

const EditableText = ({ el, canvasWidth, canvasHeight, updateElement }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== el.content) {
      ref.current.innerText = el.content;
    }
  }, [el.content]);

  const handleInput = (e) => {
    const target = e.currentTarget;
    let baseFontSize = el.baseFontSize || el.fontSize;
    let currentFontSize = baseFontSize;
    
    // Reset to base font size first to see if it can grow back
    target.style.fontSize = `${currentFontSize}px`;
    
    // Determine the base width and height the box should naturally have
    let baseWidth = el.baseWidth || (el.width || 100);
    let baseHeight = el.baseHeight || (el.height || 25);
    
    let newWidth = Math.max(baseWidth, target.scrollWidth);
    let newHeight = Math.max(baseHeight, target.scrollHeight);

    // Auto-shrink if it overflows the canvas
    while ((el.x + newWidth > canvasWidth || el.y + newHeight > canvasHeight) && currentFontSize > 6) {
      currentFontSize -= 1;
      target.style.fontSize = `${currentFontSize}px`;
      newWidth = Math.max(baseWidth, target.scrollWidth);
      newHeight = Math.max(baseHeight, target.scrollHeight);
    }

    updateElement(el.id, { 
      content: target.innerText,
      width: newWidth,
      height: newHeight,
      fontSize: currentFontSize,
      baseFontSize: baseFontSize,
      baseWidth: baseWidth,
      baseHeight: baseHeight
    });
  };

  return (
    <div
      ref={ref}
      contentEditable={true}
      suppressContentEditableWarning={true}
      style={{ outline: 'none', width: '100%', cursor: 'text' }}
      onInput={handleInput}
    />
  );
};

export default function EditSgLabelTwo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1.5);

  const [name, setName] = useState('');
  const [canvasWidth, setCanvasWidth] = useState(284);
  const [canvasHeight, setCanvasHeight] = useState(95);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Dynamic zoom calculation
  useEffect(() => {
    const updateZoom = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40; // 40px padding
        let newZoom = containerWidth / canvasWidth;
        if (newZoom > 1.5) newZoom = 1.5;
        if (newZoom < 0.4) newZoom = 0.4;
        setZoom(newZoom);
      }
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, [canvasWidth]);

  // Auto-generate template name
  useEffect(() => {
    const bottleContent = elements.find(el => el.fieldType === 'bottle')?.content;
    const variantContent = elements.find(el => el.fieldType === 'variant')?.content;
    
    if (variantContent && bottleContent) {
      if (variantContent !== '{{variantName}}' && bottleContent !== '{{bottleName}}') {
        setName(`${variantContent} - ${bottleContent}`);
      }
    } else if (bottleContent && bottleContent !== '{{bottleName}}') {
      setName(bottleContent);
    } else if (variantContent && variantContent !== '{{variantName}}') {
      setName(variantContent);
    }
  }, [elements]);

  const { brands } = useSelector(state => state.brands);
  const { bottleSpecs } = useSelector(state => state.bottleSpecs);
  const { variants } = useSelector(state => state.variants);
  // Cascading logic
  const brandElement = elements.find(el => el.fieldType === 'brand');
  const selectedBrand = brands?.find(b => b.name === brandElement?.content);
  const filteredBottleSpecs = selectedBrand 
    ? bottleSpecs?.filter(b => (b.brandId?._id || b.brandId) === selectedBrand._id) 
    : bottleSpecs;

  const bottleElement = elements.find(el => el.fieldType === 'bottle');
  const selectedBottle = bottleSpecs?.find(b => b.bottleName === bottleElement?.content);
  const filteredVariants = selectedBottle 
    ? variants?.filter(v => (v.bottleSpecId?._id || v.bottleSpecId) === selectedBottle._id) 
    : variants;

  const variantElement = elements.find(el => el.fieldType === 'variant');
  const selectedVariant = variants?.find(v => v.variantName === variantElement?.content);

  useEffect(() => {
    dispatch(fetchBrands({ limit: 1000 }));
    dispatch(fetchBottleSpecs({ pagination: 'false' }));
    dispatch(fetchVariants({ limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTemplate(id)).unwrap().then((data) => {
        setName(data.name);
        setCanvasWidth(data.canvasWidth);
        setCanvasHeight(data.canvasHeight);
        setElements(data.elements || []);
      }).catch(err => {
        Swal.fire('Error', 'Failed to load template', 'error');
        navigate('/sg-labels-2');
      });
    }
  }, [id, dispatch, navigate]);

  const addElement = (type, content = 'New Text') => {
    let fieldType = 'custom';
    if (content === '{{brandName}}') fieldType = 'brand';
    else if (content === '{{bottleName}}') fieldType = 'bottle';
    else if (content === '{{variantName}}') fieldType = 'variant';

    const newElement = {
      id: `el_${Date.now()}`,
      type,
      fieldType,
      content,
      x: 20,
      y: 20,
      width: 150,
      height: 30,
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      textAlign: 'left',
      color: '#000000',
      rotation: 0,
      zIndex: elements.length + 1
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id, changes) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...changes } : el));
  };

  const removeElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const handleSave = async () => {
    if (!name.trim()) {
      return Swal.fire('Error', 'Please provide a template name', 'warning');
    }
    
    const payload = {
      name,
      canvasWidth,
      canvasHeight,
      elements
    };

    try {
      if (id) {
        // We're editing an existing template
        await dispatch(updateTemplate({ id, data: payload })).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Template updated successfully',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/sg-labels-2');
        });
      } else {
        // We're creating a new template
        await dispatch(createTemplate(payload)).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Template created successfully',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/sg-labels-2');
        });
      }
    } catch (error) {
      Swal.fire('Error', error || `Failed to ${id ? 'update' : 'create'} template`, 'error');
    }
  };

  const handleUpdateContent = (val) => {
    updateElement(selectedElement.id, { content: val });
  };

  return (
    <div className="page-content h-100 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/sg-labels-2')} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0 }}>
            <i className="bi bi-arrow-left" style={{ fontSize: 20 }}></i>
          </button>
          <input 
            type="text" 
            className="form-control form-control-lg fw-bold border-0 bg-transparent shadow-none px-0" 
            placeholder="Template Name..." 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: '1.5rem', width: '300px' }}
          />
        </div>
      </div>

      <div className="row flex-grow-1 min-h-0 g-3">
        {/* Left Toolbar */}
        <div className="col-md-3 col-lg-2 d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '100%' }}>
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold border-bottom-0 pt-3 pb-0">Add Elements</div>
            <div className="card-body d-flex flex-column gap-2">
              <button className="btn btn-outline-primary text-start" onClick={() => addElement('text', 'Static Text')}>
                <i className="bi bi-type me-2"></i> Static Text
              </button>
              <hr className="my-2" />
              <div className="small fw-bold text-muted mb-1">Dynamic Variables</div>
              {AVAILABLE_VARIABLES.map(v => (
                <button key={v.key} className="btn btn-sm btn-outline-secondary text-start" onClick={() => addElement('variable', v.key)}>
                  <i className="bi bi-braces me-2"></i> {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="col-md-6 col-lg-7 d-flex align-items-center justify-content-center bg-light rounded-3 position-relative overflow-auto" 
             style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', minHeight: '300px' }}
             ref={containerRef}
             onClick={(e) => {
               if (e.target === e.currentTarget || e.target.id === 'canvas-container') {
                 setSelectedId(null);
               }
             }}
        >
          <div 
            id="canvas-container"
            ref={canvasRef}
            className="bg-white shadow-sm position-relative mx-auto" 
            style={{ 
              width: canvasWidth, 
              height: canvasHeight, 
              border: '1px solid #d1d5db',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {elements.map((el) => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateElement(el.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    baseWidth: parseInt(ref.style.width, 10),
                    baseHeight: parseInt(ref.style.height, 10),
                    ...position,
                  });
                }}
                bounds="parent"
                scale={zoom}
                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                className={selectedId === el.id ? 'border border-primary border-2 border-dashed' : 'border border-transparent'}
                resizeHandleStyles={{
                  top: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', top: '-3px', left: '50%', transform: 'translateX(-50%)' },
                  right: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', right: '-3px', top: '50%', transform: 'translateY(-50%)' },
                  bottom: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', bottom: '-3px', left: '50%', transform: 'translateX(-50%)' },
                  left: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', left: '-3px', top: '50%', transform: 'translateY(-50%)' },
                  topRight: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', top: '-3px', right: '-3px' },
                  bottomRight: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', bottom: '-3px', right: '-3px' },
                  bottomLeft: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', bottom: '-3px', left: '-3px' },
                  topLeft: { display: selectedId === el.id ? 'block' : 'none', width: '6px', height: '6px', background: '#fff', border: '1px solid #000', top: '-3px', left: '-3px' }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  zIndex: el.zIndex,
                  transform: `rotate(${el.rotation}deg)`,
                }}
              >
                <div style={{
                  fontSize: `${el.fontSize}px`,
                  fontWeight: el.fontWeight,
                  fontFamily: el.fontFamily,
                  color: el.color,
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                  textAlign: el.textAlign,
                  whiteSpace: el.type === 'barcode' ? 'nowrap' : 'normal',
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                }}>
                  {el.type === 'barcode' ? (
                    <div className="bg-dark text-white px-2 py-1 small rounded w-100 text-center h-100 d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-upc-scan fs-3"></i>
                      <div style={{ fontSize: '10px' }}>{el.content}</div>
                    </div>
                  ) : (
                    <EditableText 
                      el={el} 
                      canvasWidth={canvasWidth} 
                      canvasHeight={canvasHeight} 
                      updateElement={updateElement} 
                    />
                  )}
                </div>
              </Rnd>
            ))}
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="col-md-3 col-lg-3 overflow-auto" style={{ maxHeight: '100%' }}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold pt-3 pb-0 border-bottom-0">Properties</div>
            <div className="card-body">
              {!selectedElement ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-cursor fs-1 mb-2 d-block text-light-subtle"></i>
                  Select an element to edit properties
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-bold text-muted mb-1">Content</label>
                    <textarea 
                      className="form-control form-control-sm mb-3" 
                      rows="2"
                      value={selectedElement.content} 
                      onChange={e => updateElement(selectedElement.id, { content: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label small fw-bold text-muted mb-1">Font Size</label>
                    <input type="number" className="form-control form-control-sm" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value), baseFontSize: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="form-label small fw-bold text-muted mb-1">Font Weight</label>
                    <select className="form-select form-select-sm" value={selectedElement.fontWeight} onChange={e => updateElement(selectedElement.id, { fontWeight: e.target.value })}>
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label small fw-bold text-muted mb-1">Alignment</label>
                    <div className="btn-group w-100">
                      <button className={`btn btn-sm ${selectedElement.textAlign === 'left' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}><i className="bi bi-text-left"></i></button>
                      <button className={`btn btn-sm ${selectedElement.textAlign === 'center' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}><i className="bi bi-text-center"></i></button>
                      <button className={`btn btn-sm ${selectedElement.textAlign === 'right' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}><i className="bi bi-text-right"></i></button>
                    </div>
                  </div>

                  <hr className="my-1" />
                  
                  <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeElement(selectedElement.id)}>
                    <i className="bi bi-trash me-2"></i> Delete Element
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4 mb-3 user-form-actions justify-content-end w-100">
        <button onClick={handleSave} className="btn-accent px-4 py-2 shadow-sm rounded-3">
          <i className="bi bi-check2-circle me-2"></i> Save Template
        </button>
        <button type="button" onClick={() => navigate('/sg-labels-2')} className="btn btn-light px-4 py-2 shadow-sm rounded-3 border">
          Cancel
        </button>
      </div>
    </div>
  );
}
