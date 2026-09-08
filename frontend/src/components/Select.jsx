export default function Select({
  label,
  error,
  hint,
  required = false,
  options = [],
  placeholder = 'Selecione...',
  id,
  className = '',
  ...props
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const selectClass = [
    'select',
    error ? 'input--error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-group__label">
          {label}
          {required && <span className="form-group__required">*</span>}
        </label>
      )}
      <select id={selectId} className={selectClass} {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="form-group__hint">{hint}</span>}
      {error && <span className="form-group__error">{error}</span>}
    </div>
  );
}
