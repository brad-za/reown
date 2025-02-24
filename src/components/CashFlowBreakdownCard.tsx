import { IncomeBreakdown, TaxCalculation } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface CashFlowBreakdownCardProps {
    incomeBreakdown: IncomeBreakdown
}

function TaxBreakdownSection({ tax }: { tax: TaxCalculation }) {
    return (
        <div className="space-y-2 text-sm">
            <div className="text-gray-400 font-medium">Tax Calculation</div>
            <div className="flex items-center space-x-2">
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                        <span>Annual Gross</span>
                        <span className="text-gray-200">{formatMoney(tax.annualGross)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax Before Rebate</span>
                        <span className="text-red-400">
                            {formatMoney(tax.monthlyTax * 12 + tax.rebate)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Primary Rebate</span>
                        <span className="text-green-400">{formatMoney(tax.rebate)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-1 flex justify-between font-medium">
                        <span>Monthly Tax</span>
                        <span className="text-red-400">{formatMoney(tax.monthlyTax)}</span>
                    </div>
                </div>
                <div className="h-20 w-px bg-gray-700"></div>
                <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-2">Effective Tax Rate</div>
                    <div className="text-2xl font-bold text-yellow-400">
                        {formatPercentage(tax.effectiveRate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Based on annual income
                    </div>
                </div>
            </div>
        </div>
    )
}

function IncomeFlowSection({ income }: { income: IncomeBreakdown }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">ZAR Income</div>
                    <div className="text-xl font-bold text-blue-400">
                        {formatMoney(income.zarIncome)}
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">USD Income</div>
                    <div className="text-xl font-bold text-green-400">
                        ${income.usdAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                        = {formatMoney(income.usdIncome)}
                        <span className="text-xs ml-1">
                            @ R{income.exchangeRate.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-700"></div>
                <div className="px-4">
                    <div className="text-2xl font-bold text-blue-400">
                        {formatMoney(income.totalGross)}
                    </div>
                    <div className="text-sm text-gray-400">Total Gross Income</div>
                </div>
                <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <TaxBreakdownSection tax={income.taxCalculation} />

            <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-700"></div>
                <div className="px-4">
                    <div className="text-2xl font-bold text-green-400">
                        {formatMoney(income.netIncome)}
                    </div>
                    <div className="text-sm text-gray-400">Monthly Net Income</div>
                </div>
                <div className="flex-1 h-px bg-gray-700"></div>
            </div>
        </div>
    )
}

export function CashFlowBreakdownCard({ incomeBreakdown }: CashFlowBreakdownCardProps) {
    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Income & Tax Breakdown</h2>
            <IncomeFlowSection income={incomeBreakdown} />
        </div>
    )
}
