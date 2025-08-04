import React from 'react';

function CheckboxField({ label, checked, onChange, name }) {
  return (
    <label className="inline-flex items-center space-x-2 text-sm text-gray-300">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-green-500 focus:ring-green-500/50 rounded"
      />
      <span>{label}</span>
    </label>
  );
}

export default CheckboxField;