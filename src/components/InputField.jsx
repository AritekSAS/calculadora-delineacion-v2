const InputField = ({ label, type, value, onChange, placeholder, min, error }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#63ff9a] focus:border-transparent transition-all duration-300`}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export default InputField;