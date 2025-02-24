import { DashboardData, PropertyCalculations, SavingsProjection } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface ScenarioComparisonCardProps {
    data: DashboardData
    calculations: PropertyCalculations
    savingsProjection: SavingsProjection
}

function ScenarioMetrics({ title, description, income, costs, available, className }: {
    title: string
    description: string
    income: { label: string, amount: number }[]
    costs: { label: string, amount: number }[]
    available: number
    className?: string
}) {
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const totalCosts = costs.reduce((sum, item) => sum + item.amount, 0)

    return (
        <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
            {/* Header */}
            <div className="mb-6">
                <div className="text-lg font-bold text-gray-100">{title}</div>
                <div className="text-sm text-gray-400 mt-1">{description}</div>
            </div>

            {/* Income Section */}
            <div className="mb-6">
                <div className="text-sm font-medium text-gray-400 mb-3">Income</div>
                <div className="space-y-2">
                    {income.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex-1 text-sm text-gray-300">{item.label}</div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-green-400">
                                    {formatMoney(item.amount)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center pt-2 border-t border-gray-700">
                        <div className="flex-1 text-sm font-medium text-gray-300">Total Income</div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-green-400">
                                {formatMoney(totalIncome)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Costs Section */}
            <div className="mb-6">
                <div className="text-sm font-medium text-gray-400 mb-3">Monthly Costs</div>
                <div className="space-y-2">
                    {costs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex-1 text-sm text-gray-300">{item.label}</div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-red-400">
                                    {formatMoney(item.amount)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center pt-2 border-t border-gray-700">
                        <div className="flex-1 text-sm font-medium text-gray-300">Total Costs</div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-red-400">
                                {formatMoney(totalCosts)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Monthly */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-300">Available Monthly</div>
                    <div className="text-lg font-bold text-green-400">
                        {formatMoney(available)}
                    </div>
                </div>
                <div className="text-xs text-gray-400">
                    For {available >= 0 ? 'Investment/Acceleration' : 'Basic Savings'}
                </div>
            </div>
        </div>
    )
}

function TimelineComparison({ savingsProjection }: { savingsProjection: SavingsProjection }) {
    const milestones = savingsProjection.milestones
    const maxAmount = Math.max(...milestones.map(m => Math.max(m.standardAmount, m.withReturns)))

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-4">Savings Progress Timeline</div>

            <div className="space-y-3">
                {milestones.map((milestone, index) => {
                    const standardWidth = (milestone.standardAmount / maxAmount) * 100
                    const withReturnsWidth = (milestone.withReturns / maxAmount) * 100

                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Month {milestone.month}</span>
                                <span>{formatMoney(milestone.withReturns)}</span>
                            </div>
                            <div className="relative h-2 bg-gray-700 rounded">
                                <div
                                    className="absolute h-2 bg-blue-500 rounded-l"
                                    style={{ width: `${standardWidth}%` }}
                                ></div>
                                <div
                                    className="absolute h-2 bg-green-500 rounded-r"
                                    style={{ width: `${withReturnsWidth}%`, left: `${standardWidth}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-4">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Standard Savings</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>With Investment Returns</span>
                </div>
            </div>
        </div>
    )
}

export function ScenarioComparisonCard({ data, calculations, savingsProjection }: ScenarioComparisonCardProps) {
    const scenarios = [
        {
            title: "Buy & Live In",
            description: "Purchase property and live in it as primary residence",
            income: [
                { label: "Net Income", amount: calculations.monthlyNetIncome }
            ],
            costs: [
                { label: "Bond Payment", amount: calculations.monthlyBondPayment },
                { label: "Property Levies", amount: data.propertyLevies },
                { label: "Personal Expenses", amount: data.personalExpenses },
                { label: "Personal Allocation", amount: data.personalAllocation }
            ],
            available: calculations.standardAvailable
        },
        {
            title: "Buy & Rent Out",
            description: "Purchase property and rent it out while renting elsewhere",
            income: [
                { label: "Net Income", amount: calculations.monthlyNetIncome },
                { label: "Rental Income", amount: data.rentalIncome }
            ],
            costs: [
                { label: "Bond Payment", amount: calculations.monthlyBondPayment },
                { label: "Property Levies", amount: data.propertyLevies },
                { label: "Your Rent", amount: calculations.currentRent },
                { label: "Personal Expenses", amount: data.personalExpenses },
                { label: "Personal Allocation", amount: data.personalAllocation }
            ],
            available: calculations.rentOutAvailable
        },
        {
            title: "Keep Renting & Save",
            description: "Continue renting while saving for a larger deposit",
            income: [
                { label: "Net Income", amount: calculations.monthlyNetIncome }
            ],
            costs: [
                { label: "Current Rent", amount: calculations.currentRent },
                { label: "Personal Expenses", amount: data.personalExpenses },
                { label: "Personal Allocation", amount: data.personalAllocation }
            ],
            available: calculations.rentAndSaveAvailable
        }
    ]

    // Find best scenario based on available money
    const bestScenario = scenarios.reduce((best, current) =>
        current.available > best.available ? current : best
        , scenarios[0])

    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-yellow-400">Scenario Comparison</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {scenarios.map((scenario, index) => (
                    <ScenarioMetrics
                        key={index}
                        {...scenario}
                        className={scenario.title === bestScenario.title ? 'ring-2 ring-green-500' : ''}
                    />
                ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold text-gray-100">Recommended Option</div>
                        <div className="text-xl font-bold text-green-400 mt-2">{bestScenario.title}</div>
                        <div className="text-sm text-gray-400 mt-1">{bestScenario.description}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-400">Monthly Advantage</div>
                        <div className="text-3xl font-bold text-green-400 mt-1">
                            {formatMoney(bestScenario.available)}
                        </div>
                        <div className="text-sm text-gray-400">Available for growth</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
