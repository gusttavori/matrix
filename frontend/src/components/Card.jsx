export default function Card({ title, actions, footer, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="card__body">
        {children}
      </div>
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}
