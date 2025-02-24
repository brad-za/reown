import { SensitivityAnalysis } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface SensitivityAnalysisCardProps {
    sensitivity: SensitivityAnalysis
}

function VariationTable({
    data,
    title,
    valueLabel,
    impactLabel
}: {
    data: Array<{ variation?: number, income?: number, available: number, timeImpact?: number }>,
    title: string,
    valueLabel: string,
    impactLabel: string
}) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">{title}</div>
            <div className="space-y-2">
                {data.map((item, index) => {
                    const isPositive = item.available > 0
                    const hasVariation = item.variation !== undefined

                    return (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                                <span className="text-gray-300">
                                    {hasVariation && item.variation !== undefined ? (
                                        item.variation > 0 ? `+${item.variation}%` :
                                            item.variation === 0 ? 'Base' :
                                                `${item.variation}%`
                                    ) : valueLabel}
                                </span>
                                {item.income !== undefined && (
                                    <span className="text-gray-500 text-xs ml-2">
                                        ({formatMoney(item.income)})
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 text-right">
                                <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                                    {formatMoney(item.available)}
                                </span>
                                {item.timeImpact !== undefined && (
                                    <span className="text-gray-500 text-xs ml-2">
                                        ({item.timeImpact > 0 ? '-' : '+'}{Math.abs(item.timeImpact).toFixed(1)} years)
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function VacancyImpactSection({ data }: { data: SensitivityAnalysis['rental']['vacancy'] }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">Vacancy Impact</div>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{item.months} {item.months === 1 ? 'Month' : 'Months'}</span>
                            <span className="text-red-400">{formatMoney(item.lostIncome)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Monthly Impact</span>
                            <span>{formatMoney(item.monthlyImpact)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>New Available</span>
                            <span className={item.newAvailable >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatMoney(item.newAvailable)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ExchangeRateSection({ data }: { data: SensitivityAnalysis['income']['exchangeRate'] }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">Exchange Rate Impact</div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                            <span className="text-gray-300">R{item.rate.toFixed(2)}</span>
                            <span className="text-gray-500 text-xs ml-2">
                                ({formatMoney(item.zarValue)})
                            </span>
                        </div>
                        <div className="text-right">
                            <span className={item.netChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {item.netChange >= 0 ? '+' : ''}{formatMoney(item.netChange)}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">
                                ({formatMoney(item.newAvailable)})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function USDIncomeSection({ data }: { data: SensitivityAnalysis['income']['usdIncome'] }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">USD Income Changes</div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                            <span className="text-gray-300">${item.amount.toLocaleString()}</span>
                            <span className="text-gray-500 text-xs ml-2">
                                ({formatMoney(item.zarValue)})
                            </span>
                        </div>
                        <div className="text-right">
                            <span className={item.newAvailable >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatMoney(item.newAvailable)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SensitivityAnalysisCard({ sensitivity }: SensitivityAnalysisCardProps) {
    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-red-400">Sensitivity Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VariationTable
                    data={sensitivity.rental.variations}
                    title="Rental Income Variations"
                    valueLabel="Change"
                    impactLabel="Available"
                />
                <VacancyImpactSection data={sensitivity.rental.vacancy} />
                <ExchangeRateSection data={sensitivity.income.exchangeRate} />
                <USDIncomeSection data={sensitivity.income.usdIncome} />
            </div>
        </div>
    )
}
