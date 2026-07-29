import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Trends } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  trends: Trends;
}

export function LectureScoreChart({ trends }: TrendChartProps) {
  const data = {
    labels: trends.labels,
    datasets: [
      {
        label: 'Lecture Score',
        data: trends.lectureScores,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Student Satisfaction',
        data: trends.satisfaction,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        min: 3,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 0.5
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return <Line data={data} options={options} />;
}

export function ErrorTrendChart({ trends }: TrendChartProps) {
  const data = {
    labels: trends.labels,
    datasets: [
      {
        label: 'Content Errors',
        data: trends.errorCounts,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
}

export function ActionsResolvedChart({ trends }: TrendChartProps) {
  const data = {
    labels: trends.labels,
    datasets: [
      {
        label: 'Actions Resolved',
        data: trends.actionsResolved,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
}

interface ScoreDistributionProps {
  distribution: {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
    poor: number;
  };
}

export function ScoreDistributionChart({ distribution }: ScoreDistributionProps) {
  const data = {
    labels: ['Excellent (4.5+)', 'Good (4.0-4.49)', 'Satisfactory (3.5-3.99)', 'Needs Improvement (3.0-3.49)', 'Poor (<3.0)'],
    datasets: [
      {
        data: [
          distribution.excellent,
          distribution.good,
          distribution.satisfactory,
          distribution.needsImprovement,
          distribution.poor
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.9)',
          'rgba(37, 99, 235, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(249, 115, 22, 0.9)',
          'rgba(239, 68, 68, 0.9)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(37, 99, 235)',
          'rgb(245, 158, 11)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    cutout: '60%'
  };

  return <Doughnut data={data} options={options} />;
}
