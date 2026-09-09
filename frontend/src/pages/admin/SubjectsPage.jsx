import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    grades: [], // Array para cadastro em massa
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carrega disciplinas e turmas simultaneamente
      const [subjRes, classesRes] = await Promise.all([
        api.get('/api/subjects'),
        api.get('/api/classes')
      ]);
      setSubjects(subjRes.data.data);
      
      // Extrai uma lista única de Séries/Anos baseada nas turmas existentes
      const uniqueGrades = [...new Set(classesRes.data.data.map(c => c.grade))].filter(Boolean);
      setAvailableGrades(uniqueGrades.sort());
    } catch (err) {
      error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subj = null) => {
    if (subj) {
      setCurrentSubject(subj);
      setFormData({ name: subj.name, grade: subj.grade, grades: [], active: subj.active });
    } else {
      setCurrentSubject(null);
      setFormData({ name: '', grade: '', grades: [], active: true });
    }
    setModalOpen(true);
  };

  const handleCheckboxChange = (grade) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade];
    setFormData({ ...formData, grades: newGrades });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSubject) {
        // Atualiza uma disciplina específica
        await api.put(`/api/subjects/${currentSubject.id}`, formData);
        success('Disciplina atualizada com sucesso.');
      } else {
        // Cria disciplinas em massa
        if (formData.grades.length === 0) {
          return error('Selecione pelo menos uma série/ano.');
        }
        await api.post('/api/subjects/bulk', { 
          name: formData.name, 
          grades: formData.grades 
        });
        success('Disciplinas vinculadas com sucesso.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar disciplina.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/subjects/${currentSubject.id}`);
      success('Disciplina excluída com sucesso.');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao excluir disciplina.');
    }
  };

  const columns = [
    { header: 'Nome da Disciplina', accessor: 'name', width: '40%' },
    { header: 'Série/Ano', accessor: 'grade', width: '30%' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.active ? 'success' : 'neutral'}>
        {row.active ? 'Ativa' : 'Inativa'}
      </Badge>
    ), width: '15%' },
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenModal(row)} />
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setCurrentSubject(row); setDeleteConfirmOpen(true); }} />
      </div>
    ), width: '15%' }
  ];

  if (loading && subjects.length === 0) return <Loading text="Carregando disciplinas..." />;

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content { min-width: 0 !important; max-width: 100vw !important; }
        .card { min-width: 0 !important; max-width: 100% !important; overflow-x: hidden !important; }
      `}</style>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-header__title">Gestão de Disciplinas</h1>
          <p className="page-header__subtitle">Gerencie as disciplinas curriculares</p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal()}>Nova Disciplina</Button>
      </div>

      <Card>
        {subjects.length > 0 ? (
          <Table columns={columns} data={subjects} />
        ) : (
          <EmptyState 
            title="Nenhuma disciplina cadastrada" 
            description="Cadastre disciplinas para atribuir aos professores."
            actionLabel="Nova Disciplina"
            onAction={() => handleOpenModal()}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentSubject ? 'Editar Disciplina' : 'Cadastrar Disciplina em Massa'}
      >
        <form id="subject-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input 
            label="Nome da Disciplina" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="Ex: Matemática" 
            required 
          />
          
          {!currentSubject ? (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#374151' }}>
                Vincular às Séries/Anos:
              </p>
              {availableGrades.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {availableGrades.map(grade => (
                    <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.grades.includes(grade)}
                        onChange={() => handleCheckboxChange(grade)}
                        style={{ cursor: 'pointer' }}
                      />
                      {grade}
                    </label>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Nenhuma turma encontrada. Cadastre as turmas primeiro.
                </p>
              )}
            </div>
          ) : (
            <Input 
              label="Série/Ano" 
              value={formData.grade} 
              onChange={e => setFormData({...formData, grade: e.target.value})} 
              required 
            />
          )}
          
          {currentSubject && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              Disciplina Ativa
            </label>
          )}
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="subject-form">Salvar</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Disciplina"
        description={`Tem certeza que deseja excluir a disciplina ${currentSubject?.name}?`}
      />
    </div>
  );
}