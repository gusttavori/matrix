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
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enrollment: '',
    birthDate: '',
    classId: '',
    shift: 'Manhã',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/classes')
      ]);
      setStudents(studentsRes.data.data);
      setClasses(classesRes.data.data);
    } catch (err) {
      error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setCurrentStudent(student);
      setFormData({
        name: student.name,
        email: student.user.email,
        enrollment: student.enrollment,
        birthDate: new Date(student.birthDate).toISOString().split('T')[0],
        classId: student.classId.toString(),
        shift: student.shift,
        status: student.status
      });
    } else {
      setCurrentStudent(null);
      setFormData({
        name: '',
        email: '',
        enrollment: '',
        birthDate: '',
        classId: classes.length > 0 ? classes[0].id.toString() : '',
        shift: 'Manhã',
        status: 'ACTIVE'
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classId: parseInt(formData.classId, 10)
      };

      if (currentStudent) {
        delete payload.email;
        await api.put(`/api/students/${currentStudent.id}`, payload);
        success('Aluno atualizado com sucesso.');
      } else {
        await api.post('/api/students', payload);
        success('Aluno criado com sucesso.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao salvar aluno.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/students/${currentStudent.id}`);
      success('Aluno excluído com sucesso.');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao excluir aluno.');
    }
  };

  const classOptions = classes.map(c => ({
    value: c.id.toString(),
    label: `${c.name} (${c.grade}) - ${c.schoolYear}`
  }));

  const shiftOptions = [
    { value: 'Manhã', label: 'Manhã' },
    { value: 'Tarde', label: 'Tarde' },
    { value: 'Noite', label: 'Noite' },
    { value: 'Integral', label: 'Integral' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'TRANSFERRED', label: 'Transferido' },
    { value: 'GRADUATED', label: 'Formado' }
  ];

  const columns = [
    { header: 'Matrícula', accessor: 'enrollment', width: '10%' },
    { header: 'Nome', accessor: 'name', width: '30%' },
    { header: 'Turma', render: (row) => row.class.name, width: '20%' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
        {statusOptions.find(o => o.value === row.status)?.label}
      </Badge>
    ), width: '15%' },
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenModal(row)} />
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setCurrentStudent(row); setDeleteConfirmOpen(true); }} />
      </div>
    ), width: '15%' }
  ];

  if (loading && students.length === 0) return <Loading text="Carregando alunos..." />;

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content { min-width: 0 !important; max-width: 100vw !important; }
        .card { min-width: 0 !important; max-width: 100% !important; overflow-x: hidden !important; }
      `}</style>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-header__title">Gestão de Alunos</h1>
          <p className="page-header__subtitle">Gerencie os alunos da instituição</p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal()}>Novo Aluno</Button>
      </div>

      <Card>
        {students.length > 0 ? (
          <Table columns={columns} data={students} />
        ) : (
          <EmptyState 
            title="Nenhum aluno cadastrado" 
            description="Comece adicionando o primeiro aluno."
            actionLabel="Novo Aluno"
            onAction={() => handleOpenModal()}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentStudent ? 'Editar Aluno' : 'Novo Aluno'}
        size="lg"
      >
        <form id="student-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          {!currentStudent && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="E-mail (Login)" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
          )}
          <Input label="Matrícula" value={formData.enrollment} onChange={e => setFormData({...formData, enrollment: e.target.value})} required />
          <Input label="Data de Nascimento" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
          
          <Select label="Turma" options={classOptions} value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} required />
          <Select label="Turno" options={shiftOptions} value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} required />
          
          {currentStudent && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Select label="Status" options={statusOptions} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required />
            </div>
          )}
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="student-form">Salvar</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir o aluno ${currentStudent?.name}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}