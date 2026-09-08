import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Save, AlertCircle } from 'lucide-react';
import Loading from '../../../components/Loading';

export default function GradeTab({ classId, subjectId, students, periodId }) {
  const { success, error } = useToast();
  
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const initialAssessment = { name: '', date: '', maxGrade: 10, isRecovery: false };
  const [newAssessment, setNewAssessment] = useState(initialAssessment);
  
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    if (periodId) {
      loadAssessments();
    }
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
    if (!periodId) return;

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
      gMap[s.id] = { value: '', recoveryGrade: '', status: 'GRADED' };
    });

    if (assessment.grades) {
      assessment.grades.forEach(g => {
        gMap[g.studentId] = {
          value: g.value !== null ? g.value : '',
          recoveryGrade: g.recoveryGrade !== null ? g.recoveryGrade : '',
          status: g.status
        };
      });
    }
    setGrades(gMap);
  };

  const saveGrades = async () => {
    if (!selectedAssessmentId) return;

    try {
      const payload = {
        assessmentId: selectedAssessmentId,
        grades: Object.keys(grades).map(id => {
          const g = grades[id];
          return {
            studentId: parseInt(id),
            value: g.value === '' ? null : parseFloat(g.value),
            recoveryGrade: g.recoveryGrade === '' ? null : parseFloat(g.recoveryGrade),
            status: g.status
          };
        }).filter(g => g.value !== null || g.status === 'NOT_TAKEN' || g.recoveryGrade !== null)
      };

      await api.post('/api/assessments/grades', payload);
      success('Notas salvas com sucesso!');
      loadAssessments();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar notas');
    }
  };

  const updateGrade = (studentId, field, val) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <Card title="Nova Avaliação">
        <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Título da Avaliação" 
            value={newAssessment.name} 
            onChange={e => setNewAssessment({...newAssessment, name: e.target.value})} 
            required 
            placeholder="Ex: Prova Escrita"
          />
          <Input 
            label="Data de Realização" 
            type="date" 
            value={newAssessment.date} 
            onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} 
            required 
          />
          <Input 
            label="Nota Máxima (Valor)" 
            type="number" 
            step="0.1" 
            min="0"
            value={newAssessment.maxGrade} 
            onChange={e => setNewAssessment({...newAssessment, maxGrade: e.target.value})} 
            required 
          />
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="isRecovery" 
              checked={newAssessment.isRecovery}
              onChange={e => setNewAssessment({...newAssessment, isRecovery: e.target.checked})}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label htmlFor="isRecovery" style={{ cursor: 'pointer', margin: 0, fontWeight: '500' }}>Esta é uma prova de recuperação</label>
          </div>

          <Button type="submit" style={{ marginTop: '1rem' }}>Criar Avaliação</Button>
        </form>
      </Card>

      <Card title="Lançamento Rápido de Notas">
        {loading ? (
          <Loading text="Carregando avaliações..." />
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
              <div className="form-group">
                <label className="form-group__label">Selecione a Avaliação para lançar:</label>
                <select 
                  className="select" 
                  value={selectedAssessmentId || ''} 
                  onChange={(e) => {
                    const id = e.target.value ? parseInt(e.target.value) : null;
                    const assessment = assessments.find(a => a.id === id);
                    if (assessment) {
                      selectAssessment(assessment);
                    } else {
                      setSelectedAssessmentId(null);
                    }
                  }}
                >
                  <option value="">-- Selecione uma Avaliação --</option>
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({new Date(a.date).toLocaleDateString('pt-BR')}) - Máx: {a.maxGrade} pts
                      {a.isRecovery ? ' [RECUPERAÇÃO]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedAssessmentId && (
              <>
                {/* Scroll Exclusivo da Tabela para não quebrar a tela */}
                <div className="table-scroll" style={{ display: 'block', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
                  <table className="table" style={{ width: '100%', minWidth: '700px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '5%' }}>Nº</th>
                        <th>Aluno</th>
                        <th style={{ width: '20%' }}>Status</th>
                        <th style={{ width: '15%' }}>Nota Obtida</th>
                        {!currentAssessment?.isRecovery && <th style={{ width: '15%' }}>Rec. Paralela</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => {
                        const g = grades[student.id] || { value: '', recoveryGrade: '', status: 'GRADED' };
                        const notTaken = g.status === 'NOT_TAKEN';
                        
                        return (
                          <tr key={student.id} style={{ backgroundColor: notTaken ? 'var(--gray-50)' : 'transparent' }}>
                            <td>{idx + 1}</td>
                            <td>{student.name}</td>
                            <td>
                              <select 
                                className="select" 
                                style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.875rem' }}
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
                                type="number" 
                                step="0.1"
                                min="0"
                                max={currentAssessment?.maxGrade}
                                disabled={notTaken}
                                className="input"
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  height: 'auto', 
                                  textAlign: 'center',
                                  backgroundColor: notTaken ? 'var(--gray-100)' : 'var(--bg-color)',
                                  borderColor: (g.value !== '' && parseFloat(g.value) < (currentAssessment?.maxGrade * 0.6)) ? 'var(--danger-500)' : 'var(--border-color)'
                                }}
                                value={g.value}
                                onChange={(e) => updateGrade(student.id, 'value', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, student.id, 'value', idx)}
                              />
                            </td>
                            {!currentAssessment?.isRecovery && (
                              <td>
                                <input 
                                  id={`grade-rec-${idx}`}
                                  type="number" 
                                  step="0.1"
                                  min="0"
                                  max={currentAssessment?.maxGrade}
                                  disabled={notTaken}
                                  className="input"
                                  style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    height: 'auto', 
                                    textAlign: 'center',
                                    backgroundColor: notTaken ? 'var(--gray-100)' : 'var(--bg-color)'
                                  }}
                                  value={g.recoveryGrade}
                                  onChange={(e) => updateGrade(student.id, 'recoveryGrade', e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, student.id, 'rec', idx)}
                                />
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dica: Pressione "Enter" para pular para o próximo aluno.</span>
                  <Button icon={Save} onClick={saveGrades} size="lg">Salvar Notas</Button>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}