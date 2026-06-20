import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import API from '../services/api';

export default function CoatingShadeSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShades = async () => {
      setLoading(true);
      try {
        const res = await API.get('/bottle-spec/shades');
        if (res.data?.success && res.data?.data) {
          const shadeOptions = res.data.data.map(shade => ({
            value: shade,
            label: shade
          }));
          setOptions(shadeOptions);
        }
      } catch (error) {
        console.error("Failed to fetch coating shades", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShades();
  }, []);

  const handleChange = (selectedOption) => {
    onChange(selectedOption ? selectedOption.value : '');
  };

  const selectedValue = value ? { value, label: value } : null;

  return (
    <CreatableSelect
      isClearable
      isLoading={loading}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder="Select or type a shade..."
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: '12px',
          borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
          boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
          padding: '2px',
          '&:hover': {
            borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
          }
        })
      }}
    />
  );
}
