import { DashboardData, PropertyCalculations, SavingsProjection } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface WealthBuildingComparisonProps {
    data: DashboardData
    calculations: PropertyCalculations
    savingsProjection: SavingsProjection
}

interface WealthPosition {
    savings: number
    equity: number
    propertyValue: number
    netRentalIncome: number
    totalPosition: number
}

function calculateFiveYearPosition(
    data: DashboardData,
    calculations: PropertyCalculations,
    savingsProjection: SavingsProjection,
    isRental: boolean
): WealthPosition {
    const annualAppreciation = 0.05 // 5% annual property appreciation
    const propertyValue = data.housePrice * Math.pow(1 + annualAppreciation, 5)
    const propertyAppreciation = propertyValue - data.housePrice

    // Calculate equity from loan payments
    const monthlyPrincipal = calculations.monthlyBondPayment -
        (calculations.loanAmount * (data.primeRate + data.premiumAbovePrime) / 100 / 12)
    const equityFromPayments = monthlyPrincipal * 60 // 5 years

    // Calculate net rental income (if rental scenario)
    const monthlyNetRental = isRental ?
        (data.rentalIncome * 0.92) - // 8% vacancy and maintenance
        calculations.monthlyBondPayment -
        data.propertyLevies : 0
    const totalNetRental = monthlyNetRental * 60

    return {
        savings: isRental ? 0 : savingsProjection.milestones[savingsProjection.milestones.length - 1].withReturns,
        equity: isRental || calculations.standardAvailable > 0 ? equityFromPayments : 0,
        propertyValue: isRental || calculations.standardAvailable > 0 ? propertyAppreciation : 0,
        netRentalIncome: totalNetRental,
        totalPosition: (isRental || calculations.standardAvailable > 0 ?
            (equityFromPayments + propertyAppreciation) : 0) +
            (isRental ? totalNetRental : savingsProjection.milestones[savingsProjection.milestones.length - 1].withReturns)
    }
}

function ScenarioCard({ title, position, color }: {
    title: string
    position: WealthPosition
    color: string
}) {
    return (
        <div className={`bg-gray-800 rounded-lg p-4 border-l-4 ${color}`}>
            <div className="text-lg font-semibold text-gray-200 mb-4">{title}</div>
            <div className="space-y-3">
                {position.savings > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">Investment Savings</span>
                        <span className="text-green-400">{formatMoney(position.savings)}</span>
                    </div>
                )}
                {position.equity > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">Loan Equity</span>
                        <span className="text-blue-400">{formatMoney(position.equity)}</span>
                    </div>
                )}
                {position.propertyValue > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">Property Appreciation</span>
                        <span className="text-purple-400">{formatMoney(position.propertyValue)}</span>
                    </div>
                )}
                {position.netRentalIncome !== 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">Net Rental Income</span>
                        <span className={position.netRentalIncome > 0 ? "text-green-400" : "text-red-400"}>
                            {formatMoney(position.netRentalIncome)}
                        </span>
                    </div>
                )}
                <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
                    <span className="text-gray-300">Total Position</span>
                    <span className="text-xl text-yellow-400">{formatMoney(position.totalPosition)}</span>
                </div>
            </div>
        </div>
    )
}

export function WealthBuildingComparison({ data, calculations, savingsProjection }: WealthBuildingComparisonProps) {
    const savePosition = calculateFiveYearPosition(data, calculations, savingsProjection, false)
    const buyLivePosition = calculateFiveYearPosition(data, calculations, savingsProjection, false)
    const buyRentPosition = calculateFiveYearPosition(data, calculations, savingsProjection, true)

    const bestOption = [
        { name: "Save & Invest", value: savePosition.totalPosition },
        { name: "Buy & Live", value: buyLivePosition.totalPosition },
        { name: "Buy & Rent Out", value: buyRentPosition.totalPosition }
    ].reduce((a, b) => a.value > b.value ? a : b)

    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-400">5-Year Wealth Building Comparison</h2>
                <div className="text-sm">
                    <span className="text-gray-400">Best Option: </span>
                    <span className="text-green-400 font-medium">{bestOption.name}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScenarioCard
                    title="Save & Invest"
                    position={savePosition}
                    color="border-blue-500"
                />
                <ScenarioCard
                    title="Buy & Live"
                    position={buyLivePosition}
                    color="border-green-500"
                />
                <ScenarioCard
                    title="Buy & Rent Out"
                    position={buyRentPosition}
                    color="border-purple-500"
                />
            </div>

            <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Key Assumptions</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Property Appreciation: </span>
                        <span className="text-gray-300">5% p.a.</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Investment Return: </span>
                        <span className="text-gray-300">{data.investmentReturnRate}% p.a.</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Rental Vacancy: </span>
                        <span className="text-gray-300">8%</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Interest Rate: </span>
                        <span className="text-gray-300">{data.primeRate + data.premiumAbovePrime}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
