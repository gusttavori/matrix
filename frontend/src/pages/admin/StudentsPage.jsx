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
import { Plus, Edit2, Trash2, Upload, AlertCircle, History } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [occurrenceModalOpen, setOccurrenceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false); // NOVO MODAL
  
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]); // Histórico carregado
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingOccurrence, setIsSavingOccurrence] = useState(false);
  
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

  const [occurrenceData, setOccurrenceData] = useState({
    type: 'DISCIPLINARY',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
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
        email: student.user?.email || '',
        enrollment: student.enrollment,
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
        classId: student.classId?.toString() || '',
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

  const handleOpenOccurrence = (student) => {
    setCurrentStudent(student);
    setOccurrenceData({
      type: 'DISCIPLINARY',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setOccurrenceModalOpen(true);
  };

  // NOVA FUNÇÃO: Carregar Histórico
  const handleViewHistory = async (student) => {
    setCurrentStudent(student);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/students/${student.id}/occurrences`);
      setStudentHistory(res.data.data);
    } catch (err) {
      error('Erro ao carregar histórico de ocorrências.');
    } finally {
      setLoadingHistory(false);
    }
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

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return error('Selecione uma planilha primeiro.');
    
    setIsImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    
    try {
      const res = await api.post('/api/students/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      success(res.data.message || 'Importação realizada com sucesso!');
      setImportModalOpen(false);
      setFile(null);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao importar planilha. Verifique o formato.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveOccurrence = async (e) => {
    e.preventDefault();
    setIsSavingOccurrence(true);
    try {
      await api.post(`/api/students/${currentStudent.id}/occurrences`, occurrenceData);
      success('Ocorrência registrada com sucesso.');
      setOccurrenceModalOpen(false);
    } catch (err) {
      error(err.response?.data?.message || 'Erro ao registrar ocorrência.');
    } finally {
      setIsSavingOccurrence(false);
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

  const occurrenceTypeOptions = [
    { value: 'DISCIPLINARY', label: 'Indisciplina / Comportamento' },
    { value: 'HEALTH', label: 'Problema de Saúde' },
    { value: 'PEDAGOGICAL', label: 'Aviso Pedagógico' },
    { value: 'OTHER', label: 'Outros' }
  ];

  const getOccurrenceBadge = (type) => {
    switch (type) {
      case 'DISCIPLINARY': return <Badge variant="danger">Indisciplina</Badge>;
      case 'HEALTH': return <Badge variant="warning">Saúde</Badge>;
      case 'PEDAGOGICAL': return <Badge variant="primary">Pedagógico</Badge>;
      default: return <Badge variant="neutral">Outro</Badge>;
    }
  };

  const columns = [
    { header: 'Matrícula', accessor: 'enrollment', width: '10%' },
    { header: 'Nome', accessor: 'name', width: '25%' },
    { header: 'Turma', render: (row) => row.class?.name || 'Sem Turma', width: '15%' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
        {statusOptions.find(o => o.value === row.status)?.label}
      </Badge>
    ), width: '10%' },
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="warning" size="sm" icon={AlertCircle} onClick={() => handleOpenOccurrence(row)} title="Registrar Ocorrência" />
        <Button variant="primary" size="sm" icon={History} onClick={() => handleViewHistory(row)} title="Ver Histórico" />
        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenModal(row)} title="Editar Aluno" />
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setCurrentStudent(row); setDeleteConfirmOpen(true); }} title="Excluir Aluno" />
      </div>
    ), width: '40%' }
  ];

  if (loading && students.length === 0) return <Loading text="Carregando alunos..." />;

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content { min-width: 0 !important; max-width: 100vw !important; }
        .card { min-width: 0 !important; max-width: 100% !important; overflow-x: hidden !important; }
        .timeline { position: relative; padding-left: 1.5rem; margin-top: 1rem; }
        .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gray-200); }
        .timeline-item { position: relative; margin-bottom: 1.5rem; }
        .timeline-item::before { content: ''; position: absolute; left: -1.75rem; top: 0.25rem; width: 0.75rem; height: 0.75rem; border-radius: 50%; background: var(--primary-500); border: 2px solid white; box-shadow: 0 0 0 1px var(--gray-200); }
      `}</style>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-header__title">Gestão de Alunos</h1>
          <p className="page-header__subtitle">Gerencie os alunos e cadastre ocorrências</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" icon={Upload} onClick={() => setImportModalOpen(true)}>
            Importar Planilha
          </Button>
          <Button icon={Plus} onClick={() => handleOpenModal()}>
            Novo Aluno
          </Button>
        </div>
      </div>

      <Card>
        {students.length > 0 ? (
          <Table columns={columns} data={students} />
        ) : (
          <EmptyState 
            title="Nenhum aluno cadastrado" 
            description="Adicione alunos manualmente ou importe uma planilha do Excel."
            actionLabel="Novo Aluno"
            onAction={() => handleOpenModal()}
          />
        )}
      </Card>

      {/* MODAL DE CADASTRO/EDIÇÃO DE ALUNO */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={currentStudent ? 'Editar Aluno' : 'Novo Aluno'} size="lg">
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

      {/* MODAL DE IMPORTAÇÃO DE PLANILHA */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Importar Alunos">
        <form id="import-form" onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--primary-700)' }}>
              Envie um arquivo <strong>.xlsx</strong> ou <strong>.xls</strong> contendo as colunas de cabeçalho: <strong>Nome, Matrícula, Turno</strong>. Alunos com a mesma matrícula serão ignorados para evitar duplicidade.
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Selecione o arquivo Excel</label>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={(e) => setFile(e.target.files[0])} 
              required 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="secondary" onClick={() => setImportModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="import-form" loading={isImporting} icon={Upload}>Iniciar Importação</Button>
        </div>
      </Modal>

      {/* MODAL DE REGISTRAR OCORRÊNCIA */}
      <Modal isOpen={occurrenceModalOpen} onClose={() => setOccurrenceModalOpen(false)} title="Registrar Ocorrência">
        <form id="occurrence-form" onSubmit={handleSaveOccurrence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Aluno: <strong>{currentStudent?.name}</strong> ({currentStudent?.enrollment})
          </p>
          <Select 
            label="Tipo de Ocorrência" 
            options={occurrenceTypeOptions} 
            value={occurrenceData.type} 
            onChange={e => setOccurrenceData({...occurrenceData, type: e.target.value})} 
            required 
          />
          <Input 
            label="Assunto / Título" 
            placeholder="Ex: Agressão no pátio, Encaminhamento Médico..." 
            value={occurrenceData.title} 
            onChange={e => setOccurrenceData({...occurrenceData, title: e.target.value})} 
            required 
          />
          <Input 
            label="Data da Ocorrência" 
            type="date" 
            value={occurrenceData.date} 
            onChange={e => setOccurrenceData({...occurrenceData, date: e.target.value})} 
            required 
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Descrição Detalhada</label>
            <textarea 
              rows={4}
              required
              value={occurrenceData.description}
              onChange={e => setOccurrenceData({...occurrenceData, description: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Descreva detalhadamente o que aconteceu..."
            />
          </div>
        </form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="secondary" onClick={() => setOccurrenceModalOpen(false)}>Cancelar</Button>
          <Button type="submit" form="occurrence-form" loading={isSavingOccurrence} icon={AlertCircle}>Salvar</Button>
        </div>
      </Modal>

      {/* NOVO MODAL: HISTÓRICO DE OCORRÊNCIAS (TIMELINE) */}
      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title={`Histórico: ${currentStudent?.name}`} size="lg">
        {loadingHistory ? (
          <Loading text="Carregando histórico do aluno..." />
        ) : studentHistory.length > 0 ? (
          <div className="timeline">
            {studentHistory.map(occ => (
              <div key={occ.id} className="timeline-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--gray-900)' }}>{occ.title}</h4>
                  {getOccurrenceBadge(occ.type)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                  {new Date(occ.date).toLocaleDateString('pt-BR')} • Registrado por: {occ.registeredBy?.name || 'Sistema'}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)', backgroundColor: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  {occ.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Histórico Limpo" 
            description="Este aluno não possui ocorrências comportamentais ou médicas registradas."
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir o aluno ${currentStudent?.name}? Esta ação não pode ser desfeita e exigirá a remoção de notas atreladas primeiro.`}
      />
    </div>
  );
}