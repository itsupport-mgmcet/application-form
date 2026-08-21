import { memo, useState, useRef, useCallback } from 'react';
import ErrorMessage from './ErrorMessage';

const MemoizedFileField = memo(({ label, name, required = false, onChange, error }) => {
  const hasError = !!error;
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    // Trigger the parent onChange with a synthetic event
    const syntheticEvent = { target: { name, files: [file] } };
    onChange(syntheticEvent);
  }, [name, onChange]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    const syntheticEvent = { target: { name, files: [] } };
    onChange(syntheticEvent);
  };

  return (
    <div>
      <label className="block mb-1.5 text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-4 min-h-[120px] group
          ${isDragging ? 'border-green-500 bg-green-50 drop-zone-active' : ''}
          ${hasError ? 'border-red-400 bg-red-50 error-field' : !isDragging ? 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50' : ''}
        `}
      >
        {preview ? (
          <div className="relative w-full flex items-center gap-3">
            <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{fileName}</p>
              <p className="text-xs text-green-600 mt-0.5">✓ Uploaded</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors text-sm font-bold"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 transition-colors ${hasError ? 'text-red-400' : 'text-gray-400 group-hover:text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-xs font-medium text-center ${hasError ? 'text-red-500' : 'text-gray-500 group-hover:text-green-600'}`}>
              Click or drag & drop
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">JPEG, JPG, PNG · Max 150KB</p>
          </>
        )}
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <ErrorMessage error={error} />
    </div>
  );
});

export default MemoizedFileField;