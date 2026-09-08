export default function Input({
  label,
  error,
  hint,
  required = false,
  id,
  className = '',
  size = 'md',
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const inputClass = [
    'input',
    error ? 'input--error' : '',
    size === 'lg' ? 'input--lg' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-group__label">
          {label}
          {required && <span className="form-group__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={inputClass}
        {...props}
      />
      {hint && !error && <span className="form-group__hint">{hint}</span>}
      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
}
