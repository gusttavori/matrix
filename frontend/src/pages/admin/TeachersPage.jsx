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
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', identification: '', active: true
  });
  
  const [linkData, setLinkData] = useState({ classId: '', subjectId: '' });

  useEffect(() => {
    loadData();
    loadSupportData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/teachers');
      setTeachers(res.data.data);
    } catch (err) {
      error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const loadSupportData = async () => {
    try {
      const [resClasses, resSubjects] = await Promise.all([
        api.get('/api/classes'),
        api.get('/api/subjects')
      ]);
      setClasses(resClasses.data.data || []);
      setSubjects(resSubjects.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar turmas/disciplinas', err);
    }
  };

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setCurrentTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.user.email,
        identification: teacher.identification || '',
        active: teacher.active
      });
    } else {
      setCurrentTeacher(null);
      setFormData({ name: '', email: '', identification: '', active: true });
    }
    setModalOpen(true);
  };

  const handleOpenLinks = (teacher) => {
    setCurrentTeacher(teacher);
    setLinkData({ classId: '', subjectId: '' });
    setLinksModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTeacher) {
        const payload = { ...formData };
        delete payload.email; 
        await api.put(`/api/teachers/${currentTeacher.id}`, payload);
        success('Professor atualizado com sucesso.');
      } else {
        await api.post('/api/teachers', formData);
        success('Professor criado com sucesso.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar professor.');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkData.classId || !linkData.subjectId) return error('Selecione turma e disciplina');
    
    try {
      await api.post('/api/links', {
        teacherId: currentTeacher.id,
        classId: parseInt(linkData.classId, 10),
        subjectId: parseInt(linkData.subjectId, 10)
      });
      success('Vínculo criado com sucesso!');
      setLinkData({ classId: '', subjectId: '' });
      await loadData();
      
      const updatedRes = await api.get('/api/teachers');
      const updatedTeacher = updatedRes.data.data.find(t => t.id === currentTeacher.id);
      setCurrentTeacher(updatedTeacher);
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao vincular disciplina.');
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await api.delete(`/api/links/${linkId}`);
      success('Vínculo removido.');
      await loadData();
      const updatedRes = await api.get('/api/teachers');
      setCurrentTeacher(updatedRes.data.data.find(t => t.id === currentTeacher.id));
    } catch (err) {
      error('Erro ao remover vínculo.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/teachers/${currentTeacher.id}`);
      success('Professor excluído com sucesso.');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao excluir professor.');
    }
  };

  const columns = [
    { header: 'Identificação', accessor: 'identification', width: '15%' },
    { header: 'Nome', accessor: 'name', width: '35%' },
    { header: 'E-mail', render: (row) => row.user.email, width: '25%' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.active ? 'success' : 'neutral'}>
        {row.active ? 'Ativo' : 'Inativo'}
      </Badge>
    ), width: '10%' },
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => handleOpenLinks(row)} title="Vincular Turmas" />
        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenModal(row)} />
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setCurrentTeacher(row); setDeleteConfirmOpen(true); }} />
      </div>
    ), width: '15%' }
  ];

  if (loading && teachers.length === 0) return <Loading text="Carregando professores..." />;

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content { min-width: 0 !important; max-width: 100vw !important; }
        .card { min-width: 0 !important; max-width: 100% !important; overflow-x: hidden !important; }
      `}</style>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-header__title">Gestão de Professores</h1>
          <p className="page-header__subtitle">Gerencie o corpo docente</p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal()}>Novo Professor</Button>
      </div>

      <Card>
        {teachers.length > 0 ? (
          <Table columns={columns} data={teachers} />
        ) : (
          <EmptyState 
            title="Nenhum professor cadastrado" 
            description="Adicione o primeiro professor da instituição."
            actionLabel="Novo Professor"
            onAction={() => handleOpenModal()}
          />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={currentTeacher ? 'Editar Professor' : 'Novo Professor'}>
        <form id="teacher-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          {!currentTeacher && (
            <Input label="E-mail (Login)" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          )}
          <Input label="Identificação (Opcional)" value={formData.identification} onChange={e => setFormData({...formData, identification: e.target.value})} />
          {currentTeacher && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              Professor Ativo
            </label>
          )}
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="teacher-form">Salvar</Button>
        </div>
      </Modal>

      <Modal isOpen={linksModalOpen} onClose={() => setLinksModalOpen(false)} title={`Vínculos: ${currentTeacher?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>Vínculos Atuais</h4>
            {currentTeacher?.teacherClassSubjects?.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentTeacher.teacherClassSubjects.map(link => (
                  <li key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid var(--border-color)', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                      <strong>{link.class?.name}</strong> — {link.subject?.name}
                    </span>
                    <button onClick={() => handleDeleteLink(link.id)} style={{ color: 'var(--danger-600)', border: 'none', background: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nenhuma disciplina vinculada.</p>
            )}
          </div>

          <form onSubmit={handleAddLink} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="input-label" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Turma</label>
              <select className="select" value={linkData.classId} onChange={e => setLinkData({...linkData, classId: e.target.value})} required style={{ width: '100%' }}>
                <option value="">Selecione...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="input-label" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Disciplina</label>
              <select className="select" value={linkData.subjectId} onChange={e => setLinkData({...linkData, subjectId: e.target.value})} required style={{ width: '100%' }}>
                <option value="">Selecione...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Button type="submit" icon={Plus}>Adicionar</Button>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Professor"
        description={`Tem certeza que deseja excluir o professor ${currentTeacher?.name}? Esta ação não pode ser desfeita e removerá os acessos do usuário.`}
      />
    </div>
  );
}