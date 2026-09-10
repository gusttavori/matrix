import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    shift: 'Manhã',
    schoolYear: new Date().getFullYear(),
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/classes');
      setClasses(res.data.data);
    } catch (err) {
      error('Erro ao carregar dados das turmas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setCurrentClass(cls);
      setFormData({
        name: cls.name,
        grade: cls.grade,
        shift: cls.shift,
        schoolYear: cls.schoolYear,
        active: cls.active
      });
    } else {
      setCurrentClass(null);
      setFormData({
        name: '',
        grade: '',
        shift: 'Manhã',
        schoolYear: new Date().getFullYear(),
        active: true
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        schoolYear: parseInt(formData.schoolYear, 10)
      };

      if (currentClass) {
        await api.put(`/api/classes/${currentClass.id}`, payload);
        success('Turma atualizada com sucesso.');
      } else {
        await api.post('/api/classes', payload);
        success('Turma criada com sucesso.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar turma.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/classes/${currentClass.id}`);
      success('Turma excluída com sucesso.');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao excluir turma.');
    }
  };

  const shiftOptions = [
    { value: 'Manhã', label: 'Manhã' },
    { value: 'Tarde', label: 'Tarde' },
    { value: 'Noite', label: 'Noite' },
    { value: 'Integral', label: 'Integral' }
  ];

  const columns = [
    { header: 'Nome da Turma', accessor: 'name', width: '25%' },
    { header: 'Série/Ano', accessor: 'grade', width: '20%' },
    { header: 'Turno', accessor: 'shift', width: '15%' },
    { header: 'Ano Letivo', accessor: 'schoolYear', width: '10%' },
    { 
      header: 'Alunos', 
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Users size={16} /> 
          <span style={{ fontWeight: 'bold' }}>{row._count?.students || 0}</span>
        </div>
      ), 
      width: '10%' 
    },
    { header: 'Status', render: (row) => (
      <Badge variant={row.active ? 'success' : 'neutral'}>
        {row.active ? 'Ativa' : 'Inativa'}
      </Badge>
    ), width: '10%' },
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenModal(row)} />
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setCurrentClass(row); setDeleteConfirmOpen(true); }} />
      </div>
    ), width: '10%' }
  ];

  if (loading && classes.length === 0) return <Loading text="Carregando turmas..." />;

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content { min-width: 0 !important; max-width: 100vw !important; }
        .card { min-width: 0 !important; max-width: 100% !important; overflow-x: hidden !important; }
      `}</style>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-header__title">Gestão de Turmas</h1>
          <p className="page-header__subtitle">Gerencie as turmas e anos letivos</p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal()}>Nova Turma</Button>
      </div>

      <Card>
        {classes.length > 0 ? (
          <Table columns={columns} data={classes} />
        ) : (
          <EmptyState 
            title="Nenhuma turma cadastrada" 
            description="Crie turmas para vincular alunos e professores."
            actionLabel="Nova Turma"
            onAction={() => handleOpenModal()}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentClass ? 'Editar Turma' : 'Nova Turma'}
      >
        <form id="class-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Nome da Turma" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: 1º Ano A" required />
          </div>
          <Input label="Série/Ano" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="Ex: 1º Ano EM" required />
          <Select label="Turno" options={shiftOptions} value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} required />
          <Input label="Ano Letivo" type="number" value={formData.schoolYear} onChange={e => setFormData({...formData, schoolYear: e.target.value})} required />
          
          {currentClass && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              Turma Ativa
            </label>
          )}
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="class-form">Salvar</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Turma"
        description={`Tem certeza que deseja excluir a turma ${currentClass?.name}? Certifique-se de que ela não possui alunos matriculados.`}
      />
    </div>
  );
}