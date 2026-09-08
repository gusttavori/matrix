import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Users, GraduationCap, School, BookOpen } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { institution } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/teachers'),
          api.get('/api/classes'),
          api.get('/api/subjects')
        ]);

        setStats({
          students: studentsRes.data.data.length,
          teachers: teachersRes.data.data.length,
          classes: classesRes.data.data.length,
          subjects: subjectsRes.data.data.length
        });
      } catch (error) {
        console.error('Error loading stats', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const chartData = {
    labels: ['Alunos', 'Professores', 'Turmas', 'Disciplinas'],
    datasets: [
      {
        label: 'Total Cadastrado',
        data: [stats.students, stats.teachers, stats.classes, stats.subjects],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(139, 92, 246, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Visão Geral da Instituição' },
    },
  };

  if (loading) return <Loading text="Carregando dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__subtitle">Visão geral do(a) {institution?.tradeName || institution?.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-100)', padding: '1rem', borderRadius: '50%' }}>
              <Users size={24} color="var(--primary-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Total de Alunos</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.students}</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--success-100)', padding: '1rem', borderRadius: '50%' }}>
              <GraduationCap size={24} color="var(--success-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Total de Professores</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.teachers}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--warning-100)', padding: '1rem', borderRadius: '50%' }}>
              <School size={24} color="var(--warning-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Turmas Ativas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.classes}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--info-100)', padding: '1rem', borderRadius: '50%' }}>
              <BookOpen size={24} color="var(--info-600)" />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Disciplinas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.subjects}</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card title="Estatísticas">
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Bar options={chartOptions} data={chartData} />
          </div>
        </Card>
      </div>
    </div>
  );
}
