import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { Calendar, ClipboardList, CheckSquare, ArrowLeft, BookOpen, BarChart2, Lock } from 'lucide-react';

// Tabs
import AttendanceTab from './components/AttendanceTab';
import LessonTab from './components/LessonTab';
import GradeTab from './components/GradeTab';
import ClosingTab from './components/ClosingTab';
import ReportsTab from './components/ReportsTab';

export default function CadernetaPage() {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();
  
  const [activeTab, setActiveTab] = useState('attendance'); 
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [metadata, setMetadata] = useState(null);
  
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  useEffect(() => {
    loadBaseData();
  }, [classId, subjectId]);

  const loadBaseData = async () => {
    try {
      const res = await api.get(`/api/teacher-panel/class/${classId}/students`);
      setStudents(res.data.data);
      
      const classRes = await api.get('/api/teacher-panel/classes');
      const relation = classRes.data.data.find(
        c => c.classId === parseInt(classId) && c.subjectId === parseInt(subjectId)
      );

      if (relation) {
        setMetadata({ cls: relation.class, sub: relation.subject });
        await loadPeriods(relation.class.schoolYear);
      } else {
        throw new Error('Vínculo de turma não encontrado.');
      }
    } catch (err) {
      console.error('Erro detalhado ao carregar caderneta:', err);
      error('Erro ao carregar dados da turma');
      navigate('/professor');
    } finally {
      setLoading(false);
    }
  };

  const loadPeriods = async (year) => {
    try {
      const res = await api.get(`/api/teacher-panel/periods?schoolYear=${year}`);
      const per = res.data.data;
      setPeriods(per);
      
      if (per.length > 0) {
        const openPeriod = per.find(p => !p.isClosed);
        setSelectedPeriodId(openPeriod ? openPeriod.id : per[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
      error('Erro ao carregar unidades');
    }
  };

  if (loading) return <Loading text="Carregando Diário de Classe..." />;

  const currentPeriod = periods.find(p => p.id === parseInt(selectedPeriodId));

  return (
    <div style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
      <style>{`
        .app-layout__main, .app-layout__content {
          min-width: 0 !important;
          max-width: 100vw !important;
        }
        .card {
          min-width: 0 !important;
          max-width: 100% !important;
          overflow-x: hidden !important; 
        }
        .card .table-scroll {
          overflow-x: auto !important;
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/professor')} />
          <div>
            <h1 className="page-header__title" style={{ fontSize: '1.25rem' }}>{metadata?.cls?.name}</h1>
            <p className="page-header__subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <BookOpen size={16} /> {metadata?.sub?.name}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', maxWidth: '300px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Unidade/Período Ativo:</label>
          <select 
            className="select"
            style={{ fontWeight: 'bold', width: '100%' }}
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            {periods.length === 0 && <option value="">Nenhum período</option>}
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {p.name.replace(/bimestre/gi, 'unidade')} {p.isClosed ? '(FECHADO)' : ''}
              </option>
            ))}
          </select>
          {currentPeriod?.isClosed && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger-600)', fontWeight: 'bold' }}>
              ⚠️ Edições bloqueadas neste período
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ flexShrink: 0 }}>
          <Button variant={activeTab === 'attendance' ? 'primary' : 'secondary'} icon={CheckSquare} onClick={() => setActiveTab('attendance')}>
            Chamada do Dia
          </Button>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant={activeTab === 'lessons' ? 'primary' : 'secondary'} icon={Calendar} onClick={() => setActiveTab('lessons')}>
            Módulo de Aulas
          </Button>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant={activeTab === 'grades' ? 'primary' : 'secondary'} icon={ClipboardList} onClick={() => setActiveTab('grades')}>
            Avaliações e Notas
          </Button>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant={activeTab === 'reports' ? 'primary' : 'secondary'} icon={BarChart2} onClick={() => setActiveTab('reports')}>
            Relatório Individual
          </Button>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant={activeTab === 'closing' ? 'primary' : 'secondary'} icon={Lock} onClick={() => setActiveTab('closing')}>
            Fechar Unidade
          </Button>
        </div>
      </div>

      <div>
        {activeTab === 'attendance' && <AttendanceTab classId={classId} subjectId={subjectId} students={students} periodId={selectedPeriodId} />}
        {activeTab === 'lessons' && <LessonTab classId={classId} subjectId={subjectId} periodId={selectedPeriodId} />}
        {activeTab === 'grades' && <GradeTab classId={classId} subjectId={subjectId} students={students} periodId={selectedPeriodId} />}
        {activeTab === 'reports' && <ReportsTab classId={classId} subjectId={subjectId} students={students} periodId={selectedPeriodId} />}
        {activeTab === 'closing' && <ClosingTab classId={classId} subjectId={subjectId} students={students} periodId={selectedPeriodId} />}
      </div>
    </div>
  );
}