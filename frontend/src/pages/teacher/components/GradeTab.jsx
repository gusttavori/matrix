import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Save, AlertCircle, MessageSquare, Lock } from 'lucide-react';
import Loading from '../../../components/Loading';

export default function GradeTab({ classId, subjectId, students, periodId }) {
  const { success, error } = useToast();
  
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Novo estado de bloqueio
  
  const initialAssessment = { name: '', date: '', maxGrade: 10, isRecovery: false };
  const [newAssessment, setNewAssessment] = useState(initialAssessment);
  
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [grades, setGrades] = useState({});

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
    if (periodId) loadAssessments();
  }, [periodId]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/assessments/class/${classId}/subject/${subjectId}`);
      const filtered = res.data.data.filter(a => a.periodId === parseInt(periodId));
      setAssessments(filtered);
    } catch (err) {
      error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!periodId || isLocked) return;

    try {
      const payload = {
        ...newAssessment,
        classId: parseInt(classId),
        subjectId: parseInt(subjectId),
        periodId: parseInt(periodId),
        maxGrade: parseFloat(newAssessment.maxGrade)
      };
      await api.post('/api/assessments/assessment', payload);
      success('Avaliação criada!');
      setNewAssessment(initialAssessment);
      loadAssessments();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao criar avaliação');
    }
  };

  const selectAssessment = (assessment) => {
    setSelectedAssessmentId(assessment.id);
    const gMap = {};
    
    students.forEach(s => {
      gMap[s.id] = { value: '', recoveryGrade: '', status: 'GRADED', observation: '' };
    });

    if (assessment.grades) {
      assessment.grades.forEach(g => {
        gMap[g.studentId] = {
          value: g.value !== null ? g.value : '',
          recoveryGrade: g.recoveryGrade !== null ? g.recoveryGrade : '',
          status: g.status,
          observation: g.observation || ''
        };
      });
    }
    setGrades(gMap);
  };

  const saveGrades = async () => {
    if (!selectedAssessmentId || isLocked) return;

    try {
      const payload = {
        assessmentId: selectedAssessmentId,
        grades: Object.keys(grades).map(id => {
          const g = grades[id];
          return {
            studentId: parseInt(id),
            value: g.value === '' ? null : parseFloat(g.value),
            recoveryGrade: g.recoveryGrade === '' ? null : parseFloat(g.recoveryGrade),
            status: g.status,
            observation: g.observation || null
          };
        }).filter(g => g.value !== null || g.status === 'NOT_TAKEN' || g.recoveryGrade !== null || g.observation)
      };

      await api.post('/api/assessments/grades', payload);
      success('Notas salvas com sucesso!');
      loadAssessments();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar notas');
    }
  };

  const updateGrade = (studentId, field, val) => {
    if (isLocked) return;
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val }
    }));
  };

  const handleKeyDown = (e, studentId, field, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.getElementById(`grade-${field}-${idx + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  if (!periodId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Selecione um bimestre ativo para gerenciar avaliações.</p>
        </div>
      </Card>
    );
  }

  const currentAssessment = assessments.find(a => a.id === selectedAssessmentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {isLocked && (
        <div style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-800)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
          <Lock size={20} />
          <span>O período está fechado. Modo apenas visualização de notas.</span>
        </div>
      )}

      {/* Formulário Compacto de Nova Avaliação */}
      <Card title="Nova Avaliação">
        <form onSubmit={handleCreateAssessment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end', opacity: isLocked ? 0.6 : 1 }}>
          <Input label="Título da Avaliação" value={newAssessment.name} onChange={e => setNewAssessment({...newAssessment, name: e.target.value})} required placeholder="Ex: Prova Escrita" disabled={isLocked} />
          <Input label="Data" type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} required disabled={isLocked} />
          <Input label="Nota Máxima" type="number" step="0.1" min="0" value={newAssessment.maxGrade} onChange={e => setNewAssessment({...newAssessment, maxGrade: e.target.value})} required disabled={isLocked} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
            <input type="checkbox" id="isRecovery" checked={newAssessment.isRecovery} onChange={e => setNewAssessment({...newAssessment, isRecovery: e.target.checked})} disabled={isLocked} style={{ cursor: isLocked ? 'not-allowed' : 'pointer', width: '1rem', height: '1rem' }} />
            <label htmlFor="isRecovery" style={{ cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>É recuperação</label>
          </div>

          <Button type="submit" disabled={isLocked}>Criar Avaliação</Button>
        </form>
      </Card>

      {/* Lançamento em Largura Total */}
      <Card title="Lançamento Rápido de Notas">
        {loading ? (
          <Loading text="Carregando avaliações..." />
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', maxWidth: '450px' }}>
              <div className="form-group">
                <label className="form-group__label">Selecione a Avaliação:</label>
                <select 
                  className="select" 
                  value={selectedAssessmentId || ''} 
                  onChange={(e) => {
                    const id = e.target.value ? parseInt(e.target.value) : null;
                    const assessment = assessments.find(a => a.id === id);
                    if (assessment) selectAssessment(assessment);
                    else setSelectedAssessmentId(null);
                  }}
                >
                  <option value="">-- Selecione --</option>
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({new Date(a.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}) - Máx: {a.maxGrade} pts {a.isRecovery ? '[REC]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedAssessmentId && (
              <>
                <div className="table-scroll" style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem', opacity: isLocked ? 0.8 : 1 }}>
                  <table className="table" style={{ width: '100%', minWidth: '900px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '5%' }}>Nº</th>
                        <th style={{ width: '25%' }}>Aluno</th>
                        <th style={{ width: '15%' }}>Status</th>
                        <th style={{ width: '12%' }}>Nota</th>
                        {!currentAssessment?.isRecovery && <th style={{ width: '12%' }}>Recup.</th>}
                        <th style={{ width: '31%' }}>Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => {
                        const g = grades[student.id] || { value: '', recoveryGrade: '', status: 'GRADED', observation: '' };
                        const notTaken = g.status === 'NOT_TAKEN';
                        
                        return (
                          <tr key={student.id} style={{ backgroundColor: notTaken ? 'var(--gray-50)' : 'transparent' }}>
                            <td>{idx + 1}</td>
                            <td>{student.name}</td>
                            <td>
                              <select 
                                className="select" 
                                disabled={isLocked}
                                style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.875rem', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                value={g.status}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateGrade(student.id, 'status', val);
                                  if (val === 'NOT_TAKEN') {
                                    updateGrade(student.id, 'value', '');
                                    updateGrade(student.id, 'recoveryGrade', '');
                                  }
                                }}
                              >
                                <option value="GRADED">Realizada</option>
                                <option value="NOT_TAKEN">Não Realizada</option>
                              </select>
                            </td>
                            <td>
                              <input 
                                id={`grade-value-${idx}`}
                                type="number" step="0.1" min="0" max={currentAssessment?.maxGrade} disabled={notTaken || isLocked} className="input"
                                style={{ padding: '0.25rem 0.5rem', height: 'auto', textAlign: 'center', backgroundColor: notTaken ? 'var(--gray-100)' : 'var(--bg-color)', cursor: (notTaken || isLocked) ? 'not-allowed' : 'text' }}
                                value={g.value} onChange={(e) => updateGrade(student.id, 'value', e.target.value)} onKeyDown={(e) => handleKeyDown(e, student.id, 'value', idx)}
                              />
                            </td>
                            {!currentAssessment?.isRecovery && (
                              <td>
                                <input 
                                  id={`grade-rec-${idx}`}
                                  type="number" step="0.1" min="0" max={currentAssessment?.maxGrade} disabled={notTaken || isLocked} className="input"
                                  style={{ padding: '0.25rem 0.5rem', height: 'auto', textAlign: 'center', backgroundColor: notTaken ? 'var(--gray-100)' : 'var(--bg-color)', cursor: (notTaken || isLocked) ? 'not-allowed' : 'text' }}
                                  value={g.recoveryGrade} onChange={(e) => updateGrade(student.id, 'recoveryGrade', e.target.value)} onKeyDown={(e) => handleKeyDown(e, student.id, 'rec', idx)}
                                />
                              </td>
                            )}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem' }}>
                                <MessageSquare size={16} color="var(--text-secondary)" />
                                <input
                                  type="text" placeholder="Adicionar observação sobre o aluno..." value={g.observation} disabled={isLocked}
                                  onChange={(e) => updateGrade(student.id, 'observation', e.target.value)}
                                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem', cursor: isLocked ? 'not-allowed' : 'text' }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {!isLocked && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dica: Pressione "Enter" para avançar entre as notas.</span>
                    <Button icon={Save} onClick={saveGrades} size="lg">Salvar Notas</Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}