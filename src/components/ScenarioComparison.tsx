import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { formatMoney } from '../utils/calculations'

interface ScenarioComparisonProps {
    data: DashboardData
    calculations: PropertyCalculations
}

export function ScenarioComparison({ data, calculations }: ScenarioComparisonProps) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-blue-400">Compare Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Buy and Live In */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-blue-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400">Buy and Live In</h3>
                    <div>
                        <div>
                            <div className="text-sm text-gray-400">Monthly Bond</div>
                            <div className="text-lg font-semibold text-red-400">
                                - {formatMoney(calculations.monthlyBondPayment)}
                            </div>
                            <div className="text-xs text-gray-500">
                                at {(data.primeRate + data.premiumAbovePrime).toFixed(1)}% interest
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Property Expenses</div>
                            <div className="text-lg font-semibold text-red-400">
                                - {formatMoney(data.propertyLevies)}
                            </div>
                            <div className="text-xs text-gray-500">
                                maintenance & levies
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Monthly Cost</div>
                            <div className="text-lg font-semibold text-red-400">
                                - {formatMoney(calculations.monthlyBondPayment + data.propertyLevies)}
                            </div>
                            <div className="text-xs text-gray-500">
                                total monthly commitment
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Equity Building</div>
                            <div className="text-lg font-semibold text-blue-400">
                                + {formatMoney(calculations.monthlyBondPayment * 0.3)}
                            </div>
                            <div className="text-xs text-gray-500">
                                monthly principal payment
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">Available for Acceleration</div>
                            <div className="text-lg font-semibold text-blue-400">
                                {formatMoney(calculations.standardAvailable)}
                            </div>
                            <div className="text-xs text-gray-500">
                                saves {calculations.standardScenario.timeSaved.toFixed(1)} years
                            </div>
                            <div className="text-sm text-gray-400 mt-2">Interest Saved</div>
                            <div className="text-lg font-semibold text-blue-400">
                                {formatMoney(calculations.standardScenario.interestSaved)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {((calculations.standardScenario.interestSaved / calculations.loanAmount) * 100).toFixed(1)}% of loan
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buy and Rent Out */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-green-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-green-400">Buy and Rent Out</h3>
                    <div>
                        <div>
                            <div className="text-sm text-gray-400">Monthly Rent Income</div>
                            <div className="text-lg font-semibold text-green-400">
                                + {formatMoney(data.rentalIncome)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {((data.rentalIncome * 12 / data.housePrice) * 100).toFixed(1)}% yield
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Monthly Rent Cost</div>
                            <div className="text-lg font-semibold text-red-400">
                                - {formatMoney(data.monthlyRent || 0)}
                            </div>
                            <div className="text-xs text-gray-500">your rental expense</div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Property Expenses</div>
                            <div className="text-lg font-semibold text-red-400">
                                - {formatMoney(data.propertyLevies * 2)}
                            </div>
                            <div className="text-xs text-gray-500">
                                levies, maintenance & vacancy
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Net Monthly Gain</div>
                            {(() => {
                                const netGain = data.rentalIncome - (data.monthlyRent || 0) - data.propertyLevies * 2 - calculations.monthlyBondPayment;
                                return (
                                    <>
                                        <div className={`text-lg font-semibold ${netGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {netGain >= 0 ? '+ ' : ''}{formatMoney(netGain)}
                                        </div>
                                        <div className="text-xs text-gray-500">after all expenses</div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">Available for Bond</div>
                            <div className="text-lg font-semibold text-green-400">
                                {formatMoney(calculations.rentOutAvailable)}
                            </div>
                            <div className="text-xs text-gray-500">
                                saves {calculations.rentOutScenario.timeSaved.toFixed(1)} years
                            </div>
                            <div className="text-sm text-gray-400 mt-2">Interest Saved</div>
                            <div className="text-lg font-semibold text-green-400">
                                {formatMoney(calculations.rentOutScenario.interestSaved)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {((calculations.rentOutScenario.interestSaved / calculations.loanAmount) * 100).toFixed(1)}% of loan
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rent and Save */}
                <div className="bg-gray-800 rounded-lg shadow-lg border border-purple-900 p-6">
                    <h3 className="text-lg font-bold mb-4 text-purple-400">Rent and Save</h3>
                    <div>
                        <div>
                            <div className="text-sm text-gray-400">Monthly Savings</div>
                            <div className="text-lg font-semibold text-purple-400">
                                {formatMoney(calculations.rentAndSaveAvailable)}
                            </div>
                            <div className="text-xs text-gray-500">available for investment</div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Investment Return</div>
                            <div className="text-lg font-semibold text-gray-200">
                                {data.investmentReturnRate}% per year
                            </div>
                            <div className="text-xs text-gray-500">compound monthly</div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Time to Down Payment</div>
                            <div className="text-lg font-semibold text-purple-400">
                                {(() => {
                                    const r = data.investmentReturnRate / 100 / 12; // Monthly rate
                                    const PMT = calculations.rentAndSaveAvailable;
                                    const FV = data.downPayment;
                                    // n = ln(FV*r/PMT + 1) / ln(1 + r)
                                    const months = Math.log(FV * r / PMT + 1) / Math.log(1 + r);
                                    return `${Math.ceil(months / 12)} years ${Math.ceil(months % 12)} months`;
                                })()}
                            </div>
                            <div className="text-xs text-gray-500">with compound interest</div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-gray-400">Required for 5 Years</div>
                            <div className="text-lg font-semibold text-gray-200">
                                {(() => {
                                    const r = data.investmentReturnRate / 100 / 12; // Monthly rate
                                    const n = 60; // 5 years in months
                                    const FV = data.downPayment;
                                    // PMT = FV * r / ((1 + r)^n - 1)
                                    const PMT = FV * r / (Math.pow(1 + r, n) - 1);
                                    return formatMoney(PMT);
                                })()}
                            </div>
                            <div className="text-xs text-gray-500">monthly investment needed</div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">Total After 5 Years</div>
                            <div className="text-lg font-semibold text-purple-400">
                                {(() => {
                                    const r = data.investmentReturnRate / 100 / 12; // Monthly rate
                                    const n = 60; // 5 years in months
                                    const PMT = calculations.rentAndSaveAvailable;
                                    // FV = PMT * ((1 + r)^n - 1) / r
                                    const FV = PMT * (Math.pow(1 + r, n) - 1) / r;
                                    return formatMoney(FV);
                                })()}
                            </div>
                            <div className="text-xs text-gray-500">with current savings rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
