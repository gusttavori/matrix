export default function Table({ columns, data, actions }) {
  return (
    <div 
      className="table-responsive" 
      style={{ 
        width: '100%', 
        overflowX: 'auto', 
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '0.5rem'
      }}
    >
      <table className="table" style={{ width: '100%', minWidth: '750px' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ whiteSpace: 'nowrap', width: col.width }}>
                {col.header}
              </th>
            ))}
            {actions && <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length + (actions ? 1 : 0)} 
                style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}