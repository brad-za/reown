import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { formatMoney } from '../utils/calculations'

interface CashFlowCardsProps {
    data: DashboardData
    calculations: PropertyCalculations
}

function RunningTotal({ amount }: { amount: number }) {
    return (
        <div className="text-sm font-medium text-gray-500 border-l border-gray-700 pl-2 ml-2">
            = {formatMoney(amount)}
        </div>
    )
}

export function CashFlowCards({ data, calculations }: CashFlowCardsProps) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Monthly Cash Flow</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Buy and Live In */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-blue-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400">Buy and Live In</h3>
                    <div className="flex flex-col h-full">
                        {/* Income Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm text-gray-400">Monthly Income</div>
                                    <div className="text-lg font-semibold text-gray-200">
                                        {formatMoney(calculations.totalMonthlyIncome)}
                                    </div>
                                    <div className="text-xs text-gray-500">gross income</div>
                                </div>
                                <RunningTotal amount={calculations.totalMonthlyIncome} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-400">Income Tax</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(calculations.monthlyTax)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly PAYE</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome} />
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Expenses</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalExpenses)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly expenses</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome - data.personalExpenses} />
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Allocation</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalAllocation)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly allocation</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome - data.personalExpenses - data.personalAllocation} />
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-400">Bond Payment</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(calculations.monthlyBondPayment)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly bond</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome - data.personalExpenses - data.personalAllocation - calculations.monthlyBondPayment} />
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div>
                                    <div className="text-sm text-gray-400">Property Levies</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.propertyLevies)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly levies</div>
                                </div>
                                <RunningTotal amount={calculations.standardAvailable} />
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="mt-auto pt-4 border-t-2 border-gray-700">
                            <div className="text-center">
                                <div className="text-sm text-gray-400 uppercase tracking-wider">AVAILABLE CASH</div>
                                <div className="text-5xl font-bold text-blue-400 mt-4">
                                    {formatMoney(calculations.standardAvailable)}
                                </div>
                                <div className="text-sm text-gray-400 mt-3">for loan acceleration</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buy and Rent Out */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-green-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-green-400">Buy and Rent Out</h3>
                    <div className="flex flex-col h-full">
                        {/* Income Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm text-gray-400">Monthly Income</div>
                                    <div className="text-lg font-semibold text-gray-200">
                                        {formatMoney(calculations.totalMonthlyIncome)}
                                    </div>
                                    <div className="text-xs text-gray-500">gross income</div>
                                </div>
                                <RunningTotal amount={calculations.totalMonthlyIncome} />
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm text-gray-400">Income Tax</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(calculations.monthlyTax)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly PAYE</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-400">Rental Income</div>
                                    <div className="text-lg font-semibold text-green-400">
                                        + {formatMoney(data.rentalIncome)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly rental</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome + data.rentalIncome} />
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Expenses</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalExpenses)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly expenses</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome + data.rentalIncome - data.personalExpenses} />
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Allocation</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalAllocation)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly allocation</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome + data.rentalIncome - data.personalExpenses - data.personalAllocation} />
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-400">Monthly Costs</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(calculations.monthlyBondPayment + data.propertyLevies + (data.monthlyRent || 0))}
                                    </div>
                                    <div className="text-xs text-gray-500">bond + levies + rent</div>
                                </div>
                                <RunningTotal amount={calculations.rentOutAvailable} />
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="mt-auto pt-6 border-t-2 border-gray-700">
                            <div className="text-center">
                                <div className="text-sm text-gray-400 uppercase tracking-wider">AVAILABLE CASH</div>
                                <div className="text-5xl font-bold text-green-400 mt-4">
                                    {formatMoney(calculations.rentOutAvailable)}
                                </div>
                                <div className="text-sm text-gray-400 mt-3">for loan acceleration</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rent and Save */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-purple-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-purple-400">Rent and Save</h3>
                    <div className="flex flex-col h-full">
                        {/* Income Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm text-gray-400">Monthly Income</div>
                                    <div className="text-lg font-semibold text-gray-200">
                                        {formatMoney(calculations.totalMonthlyIncome)}
                                    </div>
                                    <div className="text-xs text-gray-500">gross income</div>
                                </div>
                                <RunningTotal amount={calculations.totalMonthlyIncome} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-400">Income Tax</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(calculations.monthlyTax)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly PAYE</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome} />
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Expenses</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalExpenses)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly expenses</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome - data.personalExpenses} />
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-sm text-gray-400">Personal Allocation</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.personalAllocation)}
                                    </div>
                                    <div className="text-xs text-gray-500">monthly allocation</div>
                                </div>
                                <RunningTotal amount={calculations.monthlyNetIncome - data.personalExpenses - data.personalAllocation} />
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-400">Monthly Costs</div>
                                    <div className="text-lg font-semibold text-red-400">
                                        - {formatMoney(data.monthlyRent || 0)}
                                    </div>
                                    <div className="text-xs text-gray-500">rent only</div>
                                </div>
                                <RunningTotal amount={calculations.rentAndSaveAvailable} />
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="mt-auto  border-t-2 border-gray-700">
                            <div className="text-center">
                                <div className="text-sm text-gray-400 uppercase tracking-wider">AVAILABLE CASH</div>
                                <div className="text-5xl font-bold text-purple-400 mt-4">
                                    {formatMoney(calculations.rentAndSaveAvailable)}
                                </div>
                                <div className="text-sm text-gray-400 mt-3">for savings & investment</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
