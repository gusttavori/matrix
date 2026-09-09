import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { Printer, Filter } from 'lucide-react';

export default function AcademicReportPage() {
  const [reportData, setReportData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const classRes = await api.get('/api/classes');
        const classList = classRes.data.data;
        setClasses(classList);

        const years = [...new Set(classList.map(c => c.schoolYear))].filter(Boolean).sort((a, b) => b - a);
        setSchoolYears(years);

        const defaultYear = years[0] || new Date().getFullYear();
        setSelectedSchoolYear(defaultYear.toString());

        await loadPeriodsAndReport(defaultYear.toString(), '', '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadPeriodsAndReport = async (year, classId, periodId) => {
    try {
      if (year) {
        const periodRes = await api.get(`/api/teacher-panel/periods?schoolYear=${year}`);
        setPeriods(periodRes.data.data || []);
      } else {
        setPeriods([]);
      }
      await loadReport(classId, periodId, year);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchoolYearChange = async (year) => {
    setSelectedSchoolYear(year);
    setSelectedPeriod('');
    setSelectedClass('');
    setLoading(true);
    await loadPeriodsAndReport(year, '', '');
  };

  const loadReport = async (classId, periodId, schoolYear) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.append('classId', classId);
      if (periodId) params.append('periodId', periodId);
      if (schoolYear && !classId) params.append('schoolYear', schoolYear);

      const res = await api.get(`/api/reports/academic?${params.toString()}`);
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadReport(selectedClass, selectedPeriod, selectedSchoolYear);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    if (status === 'Em Risco') return <Badge variant="danger">{status}</Badge>;
    if (status === 'Bom Desempenho') return <Badge variant="success">{status}</Badge>;
    return <Badge variant="neutral">{status}</Badge>;
  };

  const columns = [
    { header: 'Turma', accessor: 'className', width: '20%' },
    { header: 'Matrícula', accessor: 'enrollment', width: '15%' },
    { header: 'Aluno', accessor: 'name', width: '30%' },
    { header: 'Média Global', render: (row) => row.average, width: '10%' },
    { header: 'Frequência Global', render: (row) => `${row.attendancePerc}%`, width: '10%' },
    { header: 'Status', render: (row) => getStatusBadge(row.status), width: '15%' },
  ];

  const filteredClasses = selectedSchoolYear 
    ? classes.filter(c => c.schoolYear.toString() === selectedSchoolYear)
    : classes;

  if (loading && reportData.length === 0 && classes.length === 0) {
    return <Loading text="Gerando relatório acadêmico..." />;
  }

  return (
    <div className="print-container" style={{ minWidth: 0, width: '100%' }}>
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
        @media screen {
          .print-only, .print-only-flex { display: none !important; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>

      <div className="page-header no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <h1 className="page-header__title">Desempenho Acadêmico Geral</h1>
          <p className="page-header__subtitle">Acompanhe o rendimento e risco de evasão/reprovação dos alunos</p>
        </div>
        <Button icon={Printer} onClick={handlePrint}>Imprimir Relatório</Button>
      </div>

      <Card className="no-print" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 150px', maxWidth: '200px' }}>
            <Select 
              label="Ano Letivo" 
              value={selectedSchoolYear} 
              onChange={(e) => handleSchoolYearChange(e.target.value)}
              options={schoolYears.map(y => ({ value: y.toString(), label: y.toString() }))}
            />
          </div>

          <div style={{ flex: '1 1 180px', maxWidth: '250px' }}>
            <Select 
              label="Unidade / Período" 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: '', label: 'Todos os Períodos' },
                ...periods.map(p => ({ value: p.id.toString(), label: p.name }))
              ]}
            />
          </div>

          <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
            <Select 
              label="Filtrar por Turma" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Todas as Turmas do Ano' },
                ...filteredClasses.map(c => ({ value: c.id.toString(), label: `${c.name} (${c.grade})` }))
              ]}
            />
          </div>

          <Button icon={Filter} onClick={handleFilter}>Aplicar Filtro</Button>
        </div>
      </Card>

      <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Relatório de Desempenho Acadêmico Global</h2>
        <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
          Ano: {selectedSchoolYear || 'Todos'} | {selectedClass ? 'Turma Específica' : 'Todas as Turmas'}
        </h3>
        <p style={{ marginTop: '0.5rem' }}>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <Card>
        {loading ? (
          <Loading text="Carregando dados..." />
        ) : (
          <Table columns={columns} data={reportData} />
        )}
      </Card>
      
      <div className="print-only" style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        <p>* Relatório confidencial de uso interno da instituição. O Status é gerado automaticamente baseado na média inferior a 6.0 ou frequência inferior a 75%.</p>
      </div>
    </div>
  );
}