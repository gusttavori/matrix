import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Save, AlertCircle, MessageSquare, Lock } from 'lucide-react';
import Loading from '../../../components/Loading';

export default function AttendanceTab({ classId, subjectId, students, periodId }) {
  const { success, error } = useToast();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lesson, setLesson] = useState(null);
  const [attendances, setAttendances] = useState({});
  const [observations, setObservations] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Verifica o status de bloqueio toda vez que o período muda
  useEffect(() => {
    const checkLockStatus = async () => {
      try {
        const res = await api.get(`/api/teacher-reports/closing-status/${classId}/${subjectId}/${periodId}`);
        const statusData = res.data.data;
        setIsLocked(statusData.period.isClosed || statusData.isSubmitted);
      } catch (err) {
        console.error("Erro ao verificar status de bloqueio");
      }
    };
    if (periodId) checkLockStatus();
  }, [classId, subjectId, periodId]);

  useEffect(() => {
    if (periodId) loadDayAttendance();
  }, [date, periodId]);

  const loadDayAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/day/${classId}/${subjectId}/${periodId}?date=${date}`);
      const fetchedLesson = res.data.data;
      setLesson(fetchedLesson);
      
      const attMap = {};
      const obsMap = {};
      
      if (fetchedLesson && fetchedLesson.attendances.length > 0) {
        fetchedLesson.attendances.forEach(a => {
          attMap[a.studentId] = a.status;
          obsMap[a.studentId] = a.observation || '';
        });
      }
      
      students.forEach(s => {
        if (attMap[s.id] === undefined) attMap[s.id] = 'PRESENT';
        if (obsMap[s.id] === undefined) obsMap[s.id] = '';
      });
      
      setAttendances(attMap);
      setObservations(obsMap);
    } catch (err) {
      if (err.response?.status === 403) {
        // Se a API barrar totalmente o acesso, limpamos a tela
        setLesson(null);
      } else {
        error('Erro ao carregar a chamada do dia');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    if (isLocked) return;
    setAttendances(prev => ({ ...prev, [studentId]: status }));
  };

  const handleObsChange = (studentId, text) => {
    if (isLocked) return;
    setObservations(prev => ({ ...prev, [studentId]: text }));
  };

  const saveAttendance = async () => {
    if (isLocked) return;
    
    try {
      const payload = {
        classId: parseInt(classId, 10),
        subjectId: parseInt(subjectId, 10),
        periodId: parseInt(periodId, 10),
        date: date,
        attendances: Object.keys(attendances).map(id => ({
          studentId: parseInt(id, 10),
          status: attendances[id],
          observation: observations[id] || null
        }))
      };
      
      await api.post('/api/attendance', payload);
      success('Frequência e observações salvas!');
      loadDayAttendance();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar frequência');
    }
  };

  if (!periodId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Nenhum período letivo selecionado ou ativo.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Chamada Rápida do Dia">
      {isLocked && (
        <div style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-800)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
          <Lock size={20} />
          <span>O período está fechado. Modo apenas visualização.</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
        <Input 
          type="date" 
          label="Data da Aula" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          disabled={loading} // O professor pode alterar a data para ver dias passados, mesmo bloqueado
        />
      </div>

      {loading ? (
        <Loading text="Carregando lista..." />
      ) : lesson ? (
        <>
          <div className="table-scroll" style={{ display: 'block', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem', opacity: isLocked ? 0.7 : 1 }}>
            <table className="table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Nº</th>
                  <th style={{ width: '35%' }}>Aluno</th>
                  <th style={{ width: '25%', textAlign: 'center' }}>Presença</th>
                  <th style={{ width: '35%' }}>Observação (Opcional)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id}>
                    <td>{idx + 1}</td>
                    <td>{student.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={attendances[student.id]}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        disabled={isLocked}
                        style={{
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: attendances[student.id] === 'PRESENT' ? 'var(--success-50)' : 
                                           attendances[student.id] === 'ABSENT' ? 'var(--danger-50)' : 'var(--warning-50)',
                          color: attendances[student.id] === 'PRESENT' ? 'var(--success-700)' : 
                                 attendances[student.id] === 'ABSENT' ? 'var(--danger-700)' : 'var(--warning-700)',
                          fontWeight: 'bold', width: '100%', minWidth: '120px', cursor: isLocked ? 'not-allowed' : 'pointer', textAlign: 'center'
                        }}
                      >
                        <option value="PRESENT">Presente</option>
                        <option value="ABSENT">Falta</option>
                        <option value="JUSTIFIED">Justificada</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.5rem' }}>
                        <MessageSquare size={16} color="var(--text-secondary)" />
                        <input
                          type="text"
                          placeholder="Anotação..."
                          value={observations[student.id] || ''}
                          onChange={(e) => handleObsChange(student.id, e.target.value)}
                          disabled={isLocked}
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem', cursor: isLocked ? 'not-allowed' : 'text' }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLocked && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <Button icon={Save} onClick={saveAttendance} size="lg">Salvar Frequência</Button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>Nenhuma aula agendada para esta data ou a unidade foi fechada.</p>
        </div>
      )}
    </Card>
  );
}