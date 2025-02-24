import { useState } from 'react'
import { DashboardData } from '../types/dashboard'

interface InputPanelProps {
    data: DashboardData
    onChange: (data: DashboardData) => void
    isOpen: boolean
    onClose: () => void
}

export function InputPanel({ data, onChange, isOpen, onClose }: InputPanelProps) {
    const handleChange = (field: keyof DashboardData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value === '' ? 0 : Number(e.target.value)
        const newData = {
            ...data,
            [field]: newValue
        }
        console.log(`Updating ${field}:`, newValue, newData)
        onChange(newData)
    }

    if (!isOpen) return null

    const inputClasses = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
    const labelClasses = "block text-sm font-medium text-gray-300 mb-1"
    const helpTextClasses = "mt-1 text-xs text-gray-400"
    const calculatedValueClasses = "mt-1 text-xs text-green-400 font-medium"

    // Calculate derived values
    const rentalYield = (data.rentalIncome * 12 / data.housePrice) * 100
    const loanAmount = data.housePrice - data.downPayment
    const monthlyRate = (data.primeRate + data.premiumAbovePrime) / 100 / 12
    const totalPayments = data.loanTermYears * 12
    const monthlyPayment = loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1)
    const totalZARIncome = data.monthlyIncomeZAR + (data.monthlyIncomeUSD * data.exchangeRate)

    // Input validation
    const getValidationStyle = (value: number, min: number, max: number) => {
        if (value < min || value > max) {
            return "border-red-500 focus:border-red-500"
        }
        return ""
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-blue-400">Input Values</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Property Details */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClasses}>House Price</label>
                        <input
                            type="number"
                            value={data.housePrice || ''}
                            onChange={handleChange('housePrice')}
                            className={`${inputClasses} ${getValidationStyle(data.housePrice, 1000000, 5000000)}`}
                        />
                        <div className={helpTextClasses}>Recommended range: R1M - R5M</div>
                        <div className={calculatedValueClasses}>
                            Loan required: R{(data.housePrice - data.downPayment).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Down Payment</label>
                        <input
                            type="number"
                            value={data.downPayment || ''}
                            onChange={handleChange('downPayment')}
                            className={`${inputClasses} ${getValidationStyle(data.downPayment / data.housePrice * 100, 10, 50)}`}
                        />
                        <div className={helpTextClasses}>
                            {((data.downPayment / data.housePrice) * 100).toFixed(1)}% of purchase price
                        </div>
                        <div className={calculatedValueClasses}>
                            Current savings: R{data.currentSavings?.toLocaleString() || 0}
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Property Levies</label>
                        <input
                            type="number"
                            value={data.propertyLevies || ''}
                            onChange={handleChange('propertyLevies')}
                            className={`${inputClasses} ${getValidationStyle(data.propertyLevies / data.housePrice * 100 * 12, 0.5, 2)}`}
                        />
                        <div className={helpTextClasses}>
                            {((data.propertyLevies / data.housePrice) * 100 * 12).toFixed(2)}% of property value annually
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Rental Income</label>
                        <input
                            type="number"
                            value={data.rentalIncome || ''}
                            onChange={handleChange('rentalIncome')}
                            className={`${inputClasses} ${getValidationStyle(rentalYield, 5, 15)}`}
                        />
                        <div className={helpTextClasses}>
                            {rentalYield.toFixed(1)}% annual rental yield
                        </div>
                        <div className={calculatedValueClasses}>
                            {((data.rentalIncome / monthlyPayment) * 100).toFixed(1)}% of bond payment
                        </div>
                    </div>
                </div>

                {/* Loan Details */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClasses}>Prime Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.primeRate || ''}
                            onChange={handleChange('primeRate')}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Premium Above Prime (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.premiumAbovePrime || ''}
                            onChange={handleChange('premiumAbovePrime')}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Loan Term (Years)</label>
                        <input
                            type="number"
                            value={data.loanTermYears || ''}
                            onChange={handleChange('loanTermYears')}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Monthly Income */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Monthly Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClasses}>Income (ZAR)</label>
                        <input
                            type="number"
                            value={data.monthlyIncomeZAR || ''}
                            onChange={handleChange('monthlyIncomeZAR')}
                            className={inputClasses}
                            placeholder="0"
                        />
                        <div className={helpTextClasses}>
                            {((data.monthlyIncomeZAR / totalZARIncome) * 100).toFixed(1)}% of total income
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Income (USD)</label>
                        <input
                            type="number"
                            value={data.monthlyIncomeUSD || ''}
                            onChange={handleChange('monthlyIncomeUSD')}
                            className={inputClasses}
                            placeholder="0"
                        />
                        <div className={helpTextClasses}>
                            R{(data.monthlyIncomeUSD * data.exchangeRate).toLocaleString()} (ZAR)
                        </div>
                        <div className={calculatedValueClasses}>
                            {((data.monthlyIncomeUSD * data.exchangeRate / totalZARIncome) * 100).toFixed(1)}% of total income
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Exchange Rate</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.exchangeRate || ''}
                            onChange={handleChange('exchangeRate')}
                            className={`${inputClasses} ${getValidationStyle(data.exchangeRate, 15, 22)}`}
                            placeholder="0.00"
                        />
                        <div className={helpTextClasses}>Expected range: R15 - R22</div>
                    </div>
                    <div>
                        <label className={labelClasses}>Total Monthly Income</label>
                        <div className="px-3 py-2 bg-gray-600 rounded text-gray-100">
                            R{totalZARIncome.toLocaleString()}
                        </div>
                        <div className={helpTextClasses}>Combined ZAR + USD income</div>
                    </div>
                </div>

                {/* Monthly Expenses */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Monthly Expenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClasses}>Personal Allocation</label>
                        <input
                            type="number"
                            value={data.personalAllocation || ''}
                            onChange={handleChange('personalAllocation')}
                            className={`${inputClasses} ${getValidationStyle(data.personalAllocation / totalZARIncome * 100, 10, 40)}`}
                            placeholder="0"
                        />
                        <div className={helpTextClasses}>
                            {((data.personalAllocation / totalZARIncome) * 100).toFixed(1)}% of income
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Personal Expenses</label>
                        <input
                            type="number"
                            value={data.personalExpenses || ''}
                            onChange={handleChange('personalExpenses')}
                            className={`${inputClasses} ${getValidationStyle(data.personalExpenses / totalZARIncome * 100, 5, 30)}`}
                            placeholder="0"
                        />
                        <div className={helpTextClasses}>
                            {((data.personalExpenses / totalZARIncome) * 100).toFixed(1)}% of income
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Monthly Rent Cost</label>
                        <input
                            type="number"
                            value={data.monthlyRent || ''}
                            onChange={handleChange('monthlyRent')}
                            className={`${inputClasses} ${getValidationStyle((data.monthlyRent || 0) / totalZARIncome * 100, 15, 45)}`}
                            placeholder="0"
                        />
                        <div className={helpTextClasses}>
                            {(((data.monthlyRent || 0) / totalZARIncome) * 100).toFixed(1)}% of income
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Total Fixed Expenses</label>
                        <div className="px-3 py-2 bg-gray-600 rounded text-gray-100">
                            R{(data.personalAllocation + data.personalExpenses + (data.monthlyRent || 0)).toLocaleString()}
                        </div>
                        <div className={helpTextClasses}>
                            {((data.personalAllocation + data.personalExpenses + (data.monthlyRent || 0)) / totalZARIncome * 100).toFixed(1)}% of income
                        </div>
                    </div>
                </div>

                {/* Savings Details */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Savings Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClasses}>Current Savings</label>
                        <input
                            type="number"
                            value={data.currentSavings || ''}
                            onChange={handleChange('currentSavings')}
                            className={inputClasses}
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Target Down Payment</label>
                        <input
                            type="number"
                            value={data.targetDownPayment || ''}
                            onChange={handleChange('targetDownPayment')}
                            className={inputClasses}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Investment Settings */}
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Investment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className={labelClasses}>Investment Return Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.investmentReturnRate || ''}
                            onChange={handleChange('investmentReturnRate')}
                            className={inputClasses}
                            placeholder="0.0"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    )
}
