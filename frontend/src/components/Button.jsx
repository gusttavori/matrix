export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconRight: IconRight,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) {
  const classNames = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type} 
      className={classNames} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="loading--inline loading--sm">
          <span className="loading__spinner"></span>
        </span>
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={16} />}
    </button>
  );
}
