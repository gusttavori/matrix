import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import Badge from '../../../components/Badge';
import { UserCircle, X, CheckCircle, ChevronRight } from 'lucide-react';

export default function ReportsTab({ classId, subjectId, students, periodId }) {
  const { error } = useToast();
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentReport(selectedStudent.id);
    }
  }, [periodId, selectedStudent]);

  const loadStudentReport = async (studentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher-reports/student/${studentId}/class/${classId}/subject/${subjectId}?periodId=${periodId || ''}`);
      setReportData(res.data.data);
    } catch (err) {
      error('Erro ao carregar relatório individual do aluno');
    } finally {
      setLoading(false);
    }
  };

  if (selectedStudent && reportData) {
    const { student, metrics, grades, attendances } = reportData;
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', padding: '0.75rem', borderRadius: '50%' }}>
              <UserCircle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{student.name}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Matrícula: {student.enrollment}</p>
            </div>
          </div>
          <Button variant="secondary" icon={X} onClick={() => { setSelectedStudent(null); setReportData(null); }}>
            Fechar Relatório
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Média Alcançada</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: metrics.average >= 6 ? 'var(--success-600)' : 'var(--danger-600)' }}>
              {metrics.average} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/ 10</span>
            </div>
          </Card>
          <Card>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Frequência</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: metrics.attendancePerc >= 75 ? 'var(--success-600)' : 'var(--danger-600)' }}>
              {metrics.attendancePerc}%
            </div>
          </Card>
          <Card>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Situação Atual</h4>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant={metrics.status === 'APROVADO' ? 'success' : 'danger'}>{metrics.status}</Badge>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <Card title="Notas Detalhadas">
            {grades.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma nota registrada.</p>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th>Avaliação</th>
                      <th style={{ textAlign: 'center' }}>Nota Obtida</th>
                      <th style={{ textAlign: 'center' }}>Recuperação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => (
                      <tr key={g.id}>
                        <td>
                          <strong>{g.assessment.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Máx: {g.assessment.maxGrade} pts</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {g.status === 'NOT_TAKEN' ? 'N/R' : (g.value !== null ? g.value : '-')}
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--primary-600)' }}>
                          {g.recoveryGrade !== null ? g.recoveryGrade : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Histórico de Faltas">
            {attendances.filter(a => a.status === 'ABSENT').length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', color: 'var(--success-600)' }}>
                <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: '500' }}>Nenhuma falta registrada!</p>
              </div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attendances.filter(a => a.status === 'ABSENT').map(a => (
                  <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--danger-50)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: '500', color: 'var(--danger-800)' }}>{new Date(a.lesson.date).toLocaleDateString('pt-BR')}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--danger-700)' }}>{a.lesson.title || 'Aula sem título'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card title="Relatório Individual">
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Selecione um aluno para visualizar o relatório consolidado do bimestre {periodId ? 'selecionado' : 'completo (acumulado)'}.
      </p>
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Nº</th>
              <th>Aluno</th>
              <th style={{ width: '15%' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: '500' }}>{student.name}</td>
                <td>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={ChevronRight}
                    onClick={() => setSelectedStudent(student)}
                  >
                    Ver Relatório
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}