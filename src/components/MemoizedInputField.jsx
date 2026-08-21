import { memo } from "react";
import ErrorMessage from "./ErrorMessage";

const MemoizedInputField = memo(({ label, name, type = "text", required = false, placeholder = "", value, onChange, error, className = "" }) => {
  const hasError = !!error;
  return (
    <div className={className}>
      <label htmlFor={name} className="block mb-1.5 text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white transition-all duration-200 outline-none
          ${hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-field'
            : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-gray-300'
          }`}
      />
      <ErrorMessage error={error} />
    </div>
  );
});

export default MemoizedInputField;