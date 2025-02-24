import { DashboardData, PropertyCalculations, LoanProjection } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface PropertyMetricsCardProps {
    data: DashboardData
    calculations: PropertyCalculations
    loanProjection: LoanProjection
}

function RiskIndicator({ level, label }: { level: 'low' | 'moderate' | 'high', label: string }) {
    const colors = {
        low: 'bg-green-500',
        moderate: 'bg-yellow-500',
        high: 'bg-red-500'
    }

    return (
        <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${colors[level]}`}></div>
            <span className="text-sm text-gray-300">{label}</span>
        </div>
    )
}

function InvestmentMetrics({ data, calculations }: { data: DashboardData, calculations: PropertyCalculations }) {
    const rentalYield = (data.rentalIncome * 12 / data.housePrice) * 100
    const rentalCoverage = (data.rentalIncome / calculations.totalHousingCost) * 100
    const vacancyImpact = data.rentalIncome * 0.0833 // 1 month vacancy per year
    const netRentalYield = ((data.rentalIncome - vacancyImpact - data.propertyLevies) * 12 / data.housePrice) * 100
    const marketYield = 7.5 // Average market yield for comparison
    const shortfall = calculations.totalHousingCost - data.rentalIncome

    return (
        <div className="space-y-4">
            {/* Investment Returns */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-sm text-gray-400">Rental Yield</div>
                        <div className="text-3xl font-bold text-green-400 mt-1">
                            {formatPercentage(rentalYield)}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            {formatMoney(data.rentalIncome)} monthly income
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Market Average</div>
                        <div className="text-xl font-semibold text-gray-300 mt-1">
                            {formatPercentage(marketYield)}
                        </div>
                        <div className={`text-sm ${rentalYield > marketYield ? 'text-green-400' : 'text-red-400'} mt-1`}>
                            {rentalYield > marketYield ? 'Above Market' : 'Below Market'}
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                    Net yield {formatPercentage(netRentalYield)} after vacancy & levies
                </div>
            </div>

            {/* Bond Coverage */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-sm text-gray-400">Bond Coverage</div>
                        <div className="text-3xl font-bold text-blue-400 mt-1">
                            {formatPercentage(rentalCoverage)}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            {shortfall > 0 ?
                                `${formatMoney(shortfall)} monthly shortfall` :
                                `${formatMoney(-shortfall)} monthly surplus`}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Monthly Bond</div>
                        <div className="text-xl font-semibold text-gray-300 mt-1">
                            {formatMoney(calculations.monthlyBondPayment)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            + {formatMoney(data.propertyLevies)} levies
                        </div>
                    </div>
                </div>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-700">
                        <div
                            style={{ width: `${Math.min(rentalCoverage, 100)}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${rentalCoverage >= 90 ? 'bg-green-500' :
                                rentalCoverage >= 75 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                        ></div>
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    {rentalCoverage >= 90 ? 'Excellent coverage - nearly self-funding' :
                        rentalCoverage >= 75 ? 'Good coverage - manageable shortfall' :
                            'High shortfall - requires significant contribution'}
                </div>
            </div>
        </div>
    )
}

function RiskAssessment({ data, calculations }: { data: DashboardData, calculations: PropertyCalculations }) {
    const usdDependence = (data.monthlyIncomeUSD * data.exchangeRate / calculations.totalMonthlyIncome) * 100
    const rateImpact = calculations.monthlyBondPayment * 0.02 // 2% rate increase impact

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-400 font-medium">Risk Assessment</div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <RiskIndicator
                        level={usdDependence > 70 ? 'high' : usdDependence > 50 ? 'moderate' : 'low'}
                        label="Income USD Dependence"
                    />
                    <span className="text-sm text-gray-400">{formatPercentage(usdDependence)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <RiskIndicator
                        level={calculations.housingToIncomeRatio > 45 ? 'high' : calculations.housingToIncomeRatio > 35 ? 'moderate' : 'low'}
                        label="Income to Housing Ratio"
                    />
                    <span className="text-sm text-gray-400">{formatPercentage(calculations.housingToIncomeRatio)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <RiskIndicator
                        level={rateImpact > 2000 ? 'high' : rateImpact > 1000 ? 'moderate' : 'low'}
                        label="Interest Rate Sensitivity"
                    />
                    <span className="text-sm text-gray-400">+{formatMoney(rateImpact)}/month per 2%</span>
                </div>
            </div>
        </div>
    )
}

export function PropertyMetricsCard({ data, calculations, loanProjection }: PropertyMetricsCardProps) {
    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-purple-400">Property Investment Analysis</h2>

            <div className="space-y-6">
                {/* Loan Details */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Loan Amount</div>
                        <div className="text-2xl font-bold text-purple-400 mt-1">
                            {formatMoney(calculations.loanAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatPercentage((calculations.loanAmount / data.housePrice) * 100)} LTV
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Monthly Payment</div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">
                            {formatMoney(calculations.monthlyBondPayment)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {data.loanTermYears} year term
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Interest Rate</div>
                        <div className="text-2xl font-bold text-yellow-400 mt-1">
                            {formatPercentage(data.primeRate + data.premiumAbovePrime)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Prime + {data.premiumAbovePrime}%
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Total Cost</div>
                        <div className="text-2xl font-bold text-red-400 mt-1">
                            {formatMoney(data.housePrice + loanProjection.original.totalInterest)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Including {formatMoney(loanProjection.original.totalInterest)} interest
                        </div>
                    </div>
                </div>

                <InvestmentMetrics data={data} calculations={calculations} />

                <div className="border-t border-gray-800 my-6"></div>

                <RiskAssessment data={data} calculations={calculations} />

                <div className="bg-gray-800 p-4 rounded-lg mt-4">
                    <div className="text-sm text-gray-400 mb-2">Loan Acceleration Impact</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-2xl font-bold text-green-400">
                                {formatMoney(loanProjection.accelerated.interestSaved)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Total Interest Saved
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">
                                {loanProjection.accelerated.yearsSaved.toFixed(1)} years
                            </div>
                            <div className="text-xs text-gray-500">
                                Time Saved
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
