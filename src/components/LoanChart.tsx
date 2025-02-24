import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { formatMoney } from '../utils/calculations'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface LoanChartProps {
    data: DashboardData
    calculations: PropertyCalculations
}

export function LoanChart({ data, calculations }: LoanChartProps) {
    // Calculate total costs for each scenario
    const currentCost = calculations.currentRent + data.personalExpenses + data.personalAllocation
    const buyAndLiveCost = calculations.standardAvailable
    const buyAndRentCost = calculations.rentOutAvailable

    const chartData = {
        labels: ['Current', 'Buy and Live', 'Buy and Rent Out'],
        datasets: [
            {
                label: 'Monthly Costs',
                data: [currentCost, buyAndLiveCost, buyAndRentCost],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)', // blue-500
                    'rgba(16, 185, 129, 0.5)', // green-500
                    'rgba(168, 85, 247, 0.5)', // purple-500
                ],
                borderColor: [
                    '#3B82F6', // blue-500
                    '#10B981', // green-500
                    '#A855F7', // purple-500
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                display: false
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
                    label: function (context: any) {
                        if (typeof context.raw === 'number') {
                            return `Monthly Cost: ${formatMoney(context.raw)}`
                        }
                        return ''
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#374151' // gray-700
                },
                ticks: {
                    color: '#9CA3AF', // gray-400
                    font: {
                        family: "'Inter', sans-serif"
                    },
                    callback: function (value: any) {
                        if (typeof value === 'number') {
                            return formatMoney(value)
                        }
                        return ''
                    }
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#9CA3AF', // gray-400
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Monthly Cost Comparison</h2>
            <div className="w-full h-[200px]">
                <Bar data={chartData} options={options} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-sm text-gray-400">Current</div>
                    <div className="text-lg font-semibold text-blue-400">{formatMoney(currentCost)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">Buy and Live</div>
                    <div className="text-lg font-semibold text-green-400">
                        + {formatMoney(buyAndLiveCost - currentCost)}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">Buy and Rent Out</div>
                    <div className="text-lg font-semibold text-purple-400">
                        + {formatMoney(buyAndRentCost - currentCost)}
                    </div>
                </div>
            </div>
        </div>
    )
}
