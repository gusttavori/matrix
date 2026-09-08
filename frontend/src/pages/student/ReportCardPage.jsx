import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import { Printer } from 'lucide-react';
import Button from '../../components/Button';

export default function ReportCardPage() {
  const { user, institution } = useAuth();
  const [reportCard, setReportCard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [reportRes, dashRes] = await Promise.all([
          api.get('/api/student-panel/report-card'),
          api.get('/api/student-panel/dashboard')
        ]);
        setReportCard(reportRes.data.data);
        setStudentData(dashRes.data.data.student);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <Loading text="Gerando boletim..." />;

  const calculateFinalGrade = (grades) => {
    const sum = (grades['1B'] || 0) + (grades['2B'] || 0) + (grades['3B'] || 0) + (grades['4B'] || 0);
    return (sum / 4).toFixed(1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-container" style={{ minWidth: 0, width: '100%' }}>
      {/* 
        TRAVAS ABSOLUTAS DE RESPONSIVIDADE E IMPRESSÃO
        O min-width: 0 impede que o flexbox estique a página inteira no celular.
      */}
      <style>{`
        .app-layout__main, .app-layout__content {
          min-width: 0 !important; 
          max-width: 100vw !important;
        }
        
        @media screen {
          .print-only, .print-only-flex { display: none !important; }
        }
        
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-only-flex { display: flex !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .table-responsive { overflow: visible !important; }
        }

        /* Estilização suave da barra de rolagem da tabela no desktop */
        .table-responsive::-webkit-scrollbar { height: 6px; }
        .table-responsive::-webkit-scrollbar-thumb { background: var(--primary-300); border-radius: 4px; }
      `}</style>

      {/* Cabeçalho responsivo para a tela */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-header__title">Boletim Escolar</h1>
          <p className="page-header__subtitle">Desempenho Acadêmico - {new Date().getFullYear()}</p>
        </div>
        <div className="page-header__actions">
          <Button icon={Printer} onClick={handlePrint}>Imprimir</Button>
        </div>
      </div>

      <Card>
        {/* Cabeçalho exclusivo para o Papel/PDF */}
        <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{institution?.tradeName || institution?.name}</h2>
          <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Boletim Escolar - {new Date().getFullYear()}</h3>
          
          <div className="print-only-flex" style={{ justifyContent: 'space-between', marginTop: '1.5rem', textAlign: 'left' }}>
            <div>
              <p><strong>Aluno:</strong> {studentData?.name}</p>
              <p><strong>Matrícula:</strong> {studentData?.enrollment}</p>
            </div>
            <div>
              <p><strong>Turma:</strong> {studentData?.class.name} ({studentData?.class.grade})</p>
              <p><strong>Turno:</strong> {studentData?.shift}</p>
            </div>
          </div>
        </div>

        {/* 
          CONTAINER DA TABELA
          É ele quem cria o scroll no mobile enquanto o restante da página fica normal.
        */}
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
          <table className="table print-table" style={{ width: '100%', minWidth: '750px' }}>
            <thead>
              <tr>
                <th rowSpan="2" style={{ verticalAlign: 'middle', backgroundColor: 'var(--bg-secondary)' }}>Disciplina</th>
                <th colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>Notas Bimestrais</th>
                <th rowSpan="2" style={{ verticalAlign: 'middle', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>Média Final</th>
                <th colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>Frequência</th>
              </tr>
              <tr>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>1º Bim</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>2º Bim</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>3º Bim</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>4º Bim</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>Aulas</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>Faltas</th>
                <th style={{ textAlign: 'center', fontSize: '0.875rem', backgroundColor: 'var(--bg-secondary)' }}>% Freq</th>
              </tr>
            </thead>
            <tbody>
              {reportCard.map((item, idx) => {
                const final = parseFloat(calculateFinalGrade(item.grades));
                const passed = final >= 6.0;
                
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.subject}</td>
                    <td style={{ textAlign: 'center' }}>{item.grades['1B'] > 0 ? item.grades['1B'].toFixed(1) : '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.grades['2B'] > 0 ? item.grades['2B'].toFixed(1) : '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.grades['3B'] > 0 ? item.grades['3B'].toFixed(1) : '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.grades['4B'] > 0 ? item.grades['4B'].toFixed(1) : '-'}</td>
                    
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: passed ? 'var(--success-600)' : 'var(--danger-600)' }}>
                      {final > 0 ? final : '-'}
                    </td>
                    
                    <td style={{ textAlign: 'center' }}>{item.totalClasses}</td>
                    <td style={{ textAlign: 'center', color: item.totalAbsences > 0 ? 'var(--danger-500)' : 'inherit', fontWeight: item.totalAbsences > 0 ? '600' : 'normal' }}>
                      {item.totalAbsences}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={item.attendancePercentage >= 75 ? 'success' : 'danger'}>
                        {item.attendancePercentage}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé exclusivo para o Papel/PDF */}
        <div className="print-only-flex" style={{ marginTop: '4rem', justifyContent: 'space-around', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '0.5rem' }}>
            Assinatura do Responsável
          </div>
          <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '0.5rem' }}>
            Assinatura da Direção
          </div>
        </div>
      </Card>
    </div>
  );
}