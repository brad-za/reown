import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface OptimizationStrategiesProps {
    data: DashboardData
    calculations: PropertyCalculations
}

interface Strategy {
    title: string
    impact: string
    description: string
    steps: string[]
}

function calculateStrategies(data: DashboardData, calculations: PropertyCalculations): {
    tax: Strategy[]
    cost: Strategy[]
    income: Strategy[]
    risk: Strategy[]
} {
    const monthlyTaxSaving = calculations.monthlyTax * 0.15 // Estimate 15% tax optimization
    const propertyExpenseReduction = (data.propertyLevies + calculations.monthlyBondPayment) * 0.05 // 5% cost reduction
    const incomeIncrease = data.rentalIncome * 0.10 // 10% rental income increase

    return {
        tax: [
            {
                title: "Rental Property Tax Deductions",
                impact: `Save up to ${formatMoney(monthlyTaxSaving)} monthly`,
                description: "Maximize tax benefits from property ownership",
                steps: [
                    "Claim bond interest as tax deduction",
                    "Track and deduct maintenance expenses",
                    "Depreciate appliances and improvements",
                    "Keep detailed records of all property expenses"
                ]
            },
            {
                title: "Investment Structure Optimization",
                impact: "Reduce effective tax rate",
                description: "Structure investments for tax efficiency",
                steps: [
                    "Consider tax-free savings accounts",
                    "Optimize capital gains vs rental income",
                    "Time property sale for tax advantage",
                    "Structure rental through company if beneficial"
                ]
            }
        ],
        cost: [
            {
                title: "Property Cost Reduction",
                impact: `Save up to ${formatMoney(propertyExpenseReduction)} monthly`,
                description: "Reduce ongoing property expenses",
                steps: [
                    "Negotiate better insurance rates",
                    "Install energy-efficient appliances",
                    "Implement preventive maintenance",
                    "Review and optimize service contracts"
                ]
            },
            {
                title: "Bond Optimization",
                impact: "Reduce interest costs",
                description: "Optimize bond structure and payments",
                steps: [
                    "Shop for better interest rates",
                    "Consider fixing rates strategically",
                    "Make extra payments when possible",
                    "Review and renegotiate terms annually"
                ]
            }
        ],
        income: [
            {
                title: "Rental Income Maximization",
                impact: `Increase income by ${formatMoney(incomeIncrease)} monthly`,
                description: "Optimize rental property returns",
                steps: [
                    "Research and adjust to market rates",
                    "Improve property features",
                    "Minimize vacancy periods",
                    "Consider short-term rental options"
                ]
            },
            {
                title: "Investment Income Optimization",
                impact: "Maximize returns on savings",
                description: "Optimize investment strategy",
                steps: [
                    "Diversify investment portfolio",
                    "Consider higher-yield options",
                    "Regular rebalancing of investments",
                    "Monitor and adjust strategy quarterly"
                ]
            }
        ],
        risk: [
            {
                title: "Financial Risk Mitigation",
                impact: "Protect against market changes",
                description: "Reduce exposure to market risks",
                steps: [
                    "Build emergency fund",
                    "Consider rental insurance",
                    "Maintain flexible payment options",
                    "Create tenant screening process"
                ]
            },
            {
                title: "Market Risk Management",
                impact: "Protect property value",
                description: "Manage property market risks",
                steps: [
                    "Monitor market trends",
                    "Maintain property condition",
                    "Build equity buffer",
                    "Plan exit strategy options"
                ]
            }
        ]
    }
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-200">{strategy.title}</h3>
                <div className="text-sm font-medium text-green-400">{strategy.impact}</div>
            </div>
            <p className="text-sm text-gray-400 mb-3">{strategy.description}</p>
            <ul className="space-y-2">
                {strategy.steps.map((step, index) => (
                    <li key={index} className="flex items-start text-sm">
                        <span className="text-blue-400 mr-2">•</span>
                        <span className="text-gray-300">{step}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function StrategySection({ title, strategies }: { title: string, strategies: Strategy[] }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
            <div className="space-y-4">
                {strategies.map((strategy, index) => (
                    <StrategyCard key={index} strategy={strategy} />
                ))}
            </div>
        </div>
    )
}

export function OptimizationStrategies({ data, calculations }: OptimizationStrategiesProps) {
    const strategies = calculateStrategies(data, calculations)

    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-yellow-400">Optimization Strategies</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StrategySection title="Tax Optimization" strategies={strategies.tax} />
                <StrategySection title="Cost Reduction" strategies={strategies.cost} />
                <StrategySection title="Income Maximization" strategies={strategies.income} />
                <StrategySection title="Risk Mitigation" strategies={strategies.risk} />
            </div>

            <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Strategy Impact Summary</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Monthly Tax Savings</div>
                        <div className="text-lg font-medium text-green-400">
                            {formatMoney(calculations.monthlyTax * 0.15)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Cost Reduction</div>
                        <div className="text-lg font-medium text-blue-400">
                            {formatMoney((data.propertyLevies + calculations.monthlyBondPayment) * 0.05)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Income Increase</div>
                        <div className="text-lg font-medium text-purple-400">
                            {formatMoney(data.rentalIncome * 0.10)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Impact</div>
                        <div className="text-lg font-medium text-yellow-400">
                            {formatMoney(
                                calculations.monthlyTax * 0.15 +
                                (data.propertyLevies + calculations.monthlyBondPayment) * 0.05 +
                                data.rentalIncome * 0.10
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
