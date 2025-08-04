const SelectField = ({ label, value, onChange, options, disabled = false, error }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#63ff9a] focus:border-transparent transition-all duration-300 disabled:bg-gray-800/50 disabled:cursor-not-allowed`}
    >
      <option value="" disabled>-- Seleccione --</option>
      {options.map((opt) => (
        <option className="bg-gray-800 text-white" key={opt.value || opt.id} value={opt.value || opt.id}>
          {opt.label || opt.name}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export default SelectField;