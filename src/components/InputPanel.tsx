import { useState } from 'react'
import { DashboardData } from '../types/dashboard'

interface InputPanelProps {
    data: DashboardData
    onChange: (data: DashboardData) => void
}

export function InputPanel({ data, onChange }: InputPanelProps) {
    const handleChange = (field: keyof DashboardData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value === '' ? 0 : Number(e.target.value)
        const newData = {
            ...data,
            [field]: newValue
        }
        console.log(`Updating ${field}:`, newValue, newData)
        onChange(newData)
    }

    const inputClasses = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
    const labelClasses = "block text-sm font-medium text-gray-300 mb-1"

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Input Values</h2>

            {/* Property Details */}
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className={labelClasses}>House Price</label>
                    <input
                        type="number"
                        value={data.housePrice || ''}
                        onChange={handleChange('housePrice')}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Down Payment</label>
                    <input
                        type="number"
                        value={data.downPayment || ''}
                        onChange={handleChange('downPayment')}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Property Levies</label>
                    <input
                        type="number"
                        value={data.propertyLevies || ''}
                        onChange={handleChange('propertyLevies')}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Rental Income</label>
                    <input
                        type="number"
                        value={data.rentalIncome || ''}
                        onChange={handleChange('rentalIncome')}
                        className={inputClasses}
                    />
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
                </div>
                <div>
                    <label className={labelClasses}>Exchange Rate</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.exchangeRate || ''}
                        onChange={handleChange('exchangeRate')}
                        className={inputClasses}
                        placeholder="0.00"
                    />
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
                        className={inputClasses}
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className={labelClasses}>Personal Expenses</label>
                    <input
                        type="number"
                        value={data.personalExpenses || ''}
                        onChange={handleChange('personalExpenses')}
                        className={inputClasses}
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className={labelClasses}>Monthly Rent Cost</label>
                    <input
                        type="number"
                        value={data.monthlyRent || ''}
                        onChange={handleChange('monthlyRent')}
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
        </div>
    )
}
