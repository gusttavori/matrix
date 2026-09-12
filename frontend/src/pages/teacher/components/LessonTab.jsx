import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Save, AlertCircle, Edit, Trash2, Lock } from 'lucide-react';
import Loading from '../../../components/Loading';

export default function LessonTab({ classId, subjectId, periodId }) {
  const { success, error } = useToast();
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  
  const initialForm = { title: '', description: '', date: new Date().toISOString().split('T')[0], notes: '' };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (lessons.length === 0) setLoading(true); 
      
      try {
        // 1. Verifica se o período está bloqueado (Fechado pela secretaria ou Diário Entregue)
        const statusRes = await api.get(`/api/teacher-reports/closing-status/${classId}/${subjectId}/${periodId}`);
        const statusData = statusRes.data.data;
        
        if (isMounted) {
          setIsLocked(statusData.period.isClosed || statusData.isSubmitted);
        }

        // 2. Busca as aulas
        const lessonsRes = await api.get(`/api/lessons/${classId}/${subjectId}?periodId=${periodId}`);
        if (isMounted) {
          setLessons(lessonsRes.data.data);
        }
      } catch (err) {
        if (isMounted) error('Erro ao carregar os dados das aulas');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (periodId) fetchData();

    return () => { isMounted = false; };
  }, [classId, subjectId, periodId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!periodId || isLocked) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        classId: parseInt(classId),
        subjectId: parseInt(subjectId),
        periodId: parseInt(periodId)
      };

      await api.post('/api/lessons', payload);
      success('Aula salva com sucesso!');
      
      setForm(initialForm);
      setEditingLesson(null);
      
      const res = await api.get(`/api/lessons/${classId}/${subjectId}?periodId=${periodId}`);
      setLessons(res.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar aula');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (isLocked) return;
    if (!window.confirm('Deseja realmente excluir esta aula?')) return;
    try {
      await api.delete(`/api/lessons/${id}`);
      success('Aula excluída!');
      
      const res = await api.get(`/api/lessons/${classId}/${subjectId}?periodId=${periodId}`);
      setLessons(res.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao excluir aula');
    }
  };

  const editLesson = (lesson) => {
    if (isLocked) return;
    setEditingLesson(lesson.id);
    setForm({
      id: lesson.id,
      title: lesson.title || '',
      description: lesson.description || '',
      date: new Date(lesson.date).toISOString().split('T')[0],
      notes: lesson.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLessonStatus = (lesson) => {
    const today = new Date().toISOString().split('T')[0];
    const lessonDate = new Date(lesson.date).toISOString().split('T')[0];
    
    if (lessonDate > today) return { label: 'Futura', color: 'var(--gray-500)', bg: 'var(--gray-100)' };
    
    const hasAttendance = lesson.attendances && lesson.attendances.length > 0;
    const hasContent = lesson.title && lesson.title.trim().length > 0;

    if (!hasAttendance || !hasContent) return { label: 'Pendente', color: 'var(--warning-700)', bg: 'var(--warning-100)' };
    return { label: 'Lecionada', color: 'var(--success-700)', bg: 'var(--success-100)' };
  };

  if (!periodId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Selecione um período ativo para gerenciar as aulas.</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <Card title={editingLesson ? "Editar Aula" : "Registrar Nova Aula"}>
        {isLocked && (
          <div style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-800)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
            <Lock size={20} />
            <span>Unidade fechada. Edições não são permitidas.</span>
          </div>
        )}
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: isLocked ? 0.6 : 1 }}>
          <Input 
            label="Data da Aula" 
            type="date" 
            value={form.date} 
            onChange={e => setForm({...form, date: e.target.value})} 
            required 
            disabled={isLocked || saving}
          />
          <Input 
            label="Tema/Título" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
            placeholder="Ex: Equações do 1º Grau"
            disabled={isLocked || saving}
          />
          <div className="form-group">
            <label className="form-group__label">Conteúdo Ministrado / Descrição</label>
            <textarea 
              className="input" 
              rows="4" 
              style={{ height: 'auto', resize: 'vertical' }}
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              placeholder="Detalhe o que foi ensinado nesta aula..."
              disabled={isLocked || saving}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Button type="submit" icon={Save} disabled={isLocked || saving} style={{ flex: 1 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            {editingLesson && (
              <Button type="button" variant="secondary" disabled={saving} onClick={() => { setEditingLesson(null); setForm(initialForm); }} style={{ flex: 1 }}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card title="Aulas do Período">
        {loading ? (
          <Loading text="Carregando aulas..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <p>Nenhuma aula registrada neste período.</p>
              </div>
            ) : (
              lessons.map(lesson => {
                const status = getLessonStatus(lesson);
                return (
                  <div key={lesson.id} style={{ 
                    border: '1px solid var(--border-color)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    backgroundColor: !lesson.title ? 'var(--warning-50)' : 'transparent',
                    opacity: isLocked ? 0.8 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: !lesson.title ? 'var(--warning-700)' : 'inherit' }}>
                          {lesson.title || 'Aula pendente de registro'}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {new Date(lesson.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '999px',
                            backgroundColor: status.bg,
                            color: status.color,
                            fontWeight: '600'
                          }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Oculta as opções de edição se estiver travado */}
                      {!isLocked && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button variant="ghost" icon={Edit} onClick={() => editLesson(lesson)} size="sm" />
                          <Button variant="ghost" icon={Trash2} onClick={() => handleDelete(lesson.id)} size="sm" style={{ color: 'var(--danger-600)' }} />
                        </div>
                      )}

                    </div>
                    {lesson.description && (
                      <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        {lesson.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
}