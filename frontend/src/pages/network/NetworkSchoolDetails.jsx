import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { ArrowLeft, Users, BookOpen, GraduationCap, Calendar as CalendarIcon, Search } from 'lucide-react';

export default function NetworkSchoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para as barras de pesquisa
  const [searchClass, setSearchClass] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  useEffect(() => {
    async function loadSchoolDetails() {
      try {
        const res = await api.get(`/api/network/institutions/${id}/details`);
        setSchool(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar detalhes da escola.');
      } finally {
        setLoading(false);
      }
    }
    loadSchoolDetails();
  }, [id]);

  if (loading) return <Loading text="Inspecionando dados da unidade escolar..." />;
  
  if (error || !school) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{error || 'Escola não encontrada.'}</h2>
        <Button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>Voltar</Button>
      </div>
    );
  }

  // Listas filtradas com base na digitação
  const filteredClasses = (school.classes || []).filter(c => 
    c.name?.toLowerCase().includes(searchClass.toLowerCase()) || 
    c.grade?.toLowerCase().includes(searchClass.toLowerCase())
  );

  const filteredTeachers = (school.teachers || []).filter(t => 
    t.name?.toLowerCase().includes(searchTeacher.toLowerCase()) || 
    t.identification?.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const filteredStudents = (school.students || []).filter(s => 
    s.name?.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.enrollment?.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.class?.name?.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const studentColumns = [
    { header: 'Matrícula', accessor: 'enrollment' },
    { header: 'Nome do Aluno', accessor: 'name' },
    { header: 'Turma', render: (row) => row.class ? row.class.name : 'Sem Turma' },
    { header: 'Status', accessor: 'status' }
  ];

  const teacherColumns = [
    { header: 'Nome do Professor', accessor: 'name' },
    { header: 'Identificação', accessor: 'identification' },
    { header: 'Vínculos (Turmas)', render: (row) => row.teacherClassSubjects?.length || 0 }
  ];

  const classColumns = [
    { header: 'Nome da Turma', accessor: 'name' },
    { header: 'Série/Ano', accessor: 'grade' },
    { header: 'Turno', accessor: 'shift' },
    { header: 'Qtd. Alunos', render: (row) => row._count?.students || 0 }
  ];

  // Componente reutilizável de barra de pesquisa
  const renderSearchBar = (value, setter, placeholder) => (
    <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setter(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '0.6rem 1rem 0.6rem 2.5rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          outline: 'none',
          fontSize: '0.875rem',
          backgroundColor: 'var(--bg-color)'
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)} />
        <div>
          <h1 className="page-header__title">{school.name}</h1>
          <p className="page-header__subtitle">
            {school.city}/{school.state} - Documento: {school.document || 'N/A'} - Tipo: {school.type === 'PUBLIC' ? 'Pública (Rede)' : 'Privada'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--primary-600)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Alunos Matriculados</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{school.students?.length || 0}</h2>
          </div>
        </Card>
        
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', color: 'var(--warning-600)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Professores</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{school.teachers?.length || 0}</h2>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-50)', borderRadius: 'var(--radius-md)', color: 'var(--success-600)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Turmas Ativas</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{school.classes?.length || 0}</h2>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-50)', borderRadius: 'var(--radius-md)', color: 'var(--danger-600)' }}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Períodos Letivos</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{school.academicPeriods?.length || 0}</h2>
          </div>
        </Card>
      </div>

      <Card title={`Turmas Registradas (${filteredClasses.length})`}>
        {renderSearchBar(searchClass, setSearchClass, "Pesquisar por nome ou série da turma...")}
        <Table columns={classColumns} data={filteredClasses} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
        <Card title={`Corpo Docente (${filteredTeachers.length})`}>
          {renderSearchBar(searchTeacher, setSearchTeacher, "Pesquisar por nome ou ID do professor...")}
          <Table columns={teacherColumns} data={filteredTeachers} />
        </Card>

        <Card title={`Alunos (${filteredStudents.length})`}>
          {renderSearchBar(searchStudent, setSearchStudent, "Pesquisar por nome, matrícula ou turma...")}
          <Table columns={studentColumns} data={filteredStudents} />
        </Card>
      </div>
      
    </div>
  );
}