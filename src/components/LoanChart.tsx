import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { generateVisualizationData, formatMoney } from '../utils/calculations'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

interface LoanChartProps {
    data: DashboardData
    calculations: PropertyCalculations
}

export function LoanChart({ data, calculations }: LoanChartProps) {
    const points = generateVisualizationData(data, calculations)

    const chartData = {
        labels: points.map(p => `Year ${(p.month / 12).toFixed(1)}`),
        datasets: [
            {
                label: 'Standard Loan',
                data: points.map(p => p.standardLoanBalance),
                borderColor: '#6B7280', // gray-500
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                tension: 0.4,
                fill: false
            },
            {
                label: 'Buy and Live In',
                data: points.map(p => p.standardAccelBalance),
                borderColor: '#3B82F6', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: false
            },
            {
                label: 'Buy and Rent Out',
                data: points.map(p => p.rentOutBalance),
                borderColor: '#10B981', // green-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: false
            }
        ]
    }

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#F3F4F6', // text-gray-100
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900
                titleColor: '#F3F4F6', // text-gray-100
                bodyColor: '#F3F4F6', // text-gray-100
                borderColor: '#374151', // gray-700
                borderWidth: 1,
                padding: 12,
                bodyFont: {
                    family: "'Inter', sans-serif"
                },
                callbacks: {
                    label: function (context) {
                        if (typeof context.raw === 'number') {
                            return `${context.dataset.label}: ${formatMoney(context.raw)}`
                        }
                        return ''
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'category',
                grid: {
                    color: '#374151' // gray-700
                },
                ticks: {
                    color: '#9CA3AF', // gray-400
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                type: 'linear' as const,
                grid: {
                    color: '#374151' // gray-700
                },
                ticks: {
                    color: '#9CA3AF', // gray-400
                    font: {
                        family: "'Inter', sans-serif"
                    },
                    callback: function (value) {
                        if (typeof value === 'number') {
                            return formatMoney(value)
                        }
                        return ''
                    }
                }
            }
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Loan Balance Over Time</h2>
            <div className="w-full h-[400px]">
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}
