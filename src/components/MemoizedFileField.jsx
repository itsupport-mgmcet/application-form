import { memo } from 'react'
import ErrorMessage from './ErrorMessage';

const MemoizedFileField = memo(({ label, name, required = false, onChange, error }) => {
  const hasError = !!error;
  return (
    <div>
      <label htmlFor={name} className="block mb-2 font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input id={name} name={name} type="file" accept="image/*"
        onChange={onChange}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${hasError ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`}
      />
      <ErrorMessage error={error} />
    </div>
  );
});
export default MemoizedFileField