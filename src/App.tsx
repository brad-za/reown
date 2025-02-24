import { useState, useMemo, useEffect } from 'react'
import { DashboardData } from './types/dashboard'
import {
  calculateAll,
  calculateIncomeBreakdown,
  calculateLoanProjection,
  calculateSavingsProjection,
  calculateSensitivityAnalysis
} from './utils/calculations'
import { InputPanel } from './components/InputPanel'
import { CashFlowBreakdownCard } from './components/CashFlowBreakdownCard'
import { PropertyMetricsCard } from './components/PropertyMetricsCard'
import { ScenarioComparisonCard } from './components/ScenarioComparisonCard'
import { SensitivityAnalysisCard } from './components/SensitivityAnalysisCard'
import { WealthBuildingComparison } from './components/WealthBuildingComparison'
import { DecisionTimeline } from './components/DecisionTimeline'
import { OptimizationStrategies } from './components/OptimizationStrategies'
import { LoanChart } from './components/LoanChart'

const defaultData: DashboardData = {
  // Property details
  housePrice: 2500000,
  downPayment: 600000, // Target down payment
  primeRate: 11.75,
  premiumAbovePrime: 2,
  loanTermYears: 20,

  // Income & expenses
  monthlyIncomeZAR: 10000,
  monthlyIncomeUSD: 1600,
  exchangeRate: 18.50,
  rentalIncome: 22500, // 10.8% annual yield on R2.5M
  monthlyRent: 12000,

  // Investment settings
  investmentReturnRate: 8, // 8% annual return

  // Monthly expenses
  personalAllocation: 10000,
  personalExpenses: 4000,
  propertyLevies: 2200 // Updated from feedback
}

function App() {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false)

  // Initialize state from localStorage or default
  const [data, setData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem('propertyDashboardData')
      return saved ? JSON.parse(saved) : defaultData
    } catch (error) {
      console.error('Failed to load saved data:', error)
      return defaultData
    }
  })

  const handleDataChange = (newData: DashboardData) => {
    console.log('Data updated:', newData)
    setData(newData)
  }

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('propertyDashboardData', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }, [data])

  const calculations = useMemo(() => {
    console.log('Recalculating with data:', data)
    return calculateAll(data)
  }, [data])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">🏠 Property Financial Analysis</h1>

        {/* Info Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-2">Buy Now (R2.5M)</h3>
              <p className="text-gray-300">Analysis of affordability for a R2.5M property with your current savings and income.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-2">Investment Property</h3>
              <p className="text-gray-300">Evaluate the property as an investment, comparing rental income against costs.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">Wait and Save</h3>
              <p className="text-gray-300">Track progress towards R600,000 down payment goal by Feb 2025.</p>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setIsInputModalOpen(true)}
          className="mb-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg flex items-center space-x-2 border border-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Edit Values</span>
        </button>

        {/* Input Panel Modal */}
        <InputPanel
          data={data}
          onChange={handleDataChange}
          isOpen={isInputModalOpen}
          onClose={() => setIsInputModalOpen(false)}
        />

        {/* Financial Analysis */}
        <div className="mt-8">
          <div className="space-y-8">
            {/* Income & Tax Analysis */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <CashFlowBreakdownCard
                incomeBreakdown={useMemo(() => calculateIncomeBreakdown(data), [data])}
              />
            </div>

            {/* Property Investment Analysis */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <PropertyMetricsCard
                data={data}
                calculations={calculations}
                loanProjection={useMemo(() => calculateLoanProjection(
                  calculations.loanAmount,
                  data.primeRate + data.premiumAbovePrime,
                  data.loanTermYears,
                  calculations.rentOutAvailable
                ), [calculations.loanAmount, data.primeRate, data.premiumAbovePrime, data.loanTermYears, calculations.rentOutAvailable])}
              />
            </div>

            {/* Scenario Analysis */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <ScenarioComparisonCard
                data={data}
                calculations={calculations}
                savingsProjection={useMemo(() => calculateSavingsProjection(
                  calculations.currentSavings,
                  600000,
                  calculations.rentAndSaveAvailable,
                  data.investmentReturnRate
                ), [calculations.currentSavings, calculations.rentAndSaveAvailable, data.investmentReturnRate])}
              />
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <SensitivityAnalysisCard
                sensitivity={useMemo(() => calculateSensitivityAnalysis(data, calculations), [data, calculations])}
              />
            </div>

            {/* Wealth Building Analysis */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <WealthBuildingComparison
                data={data}
                calculations={calculations}
                savingsProjection={useMemo(() => calculateSavingsProjection(
                  calculations.currentSavings,
                  600000,
                  calculations.rentAndSaveAvailable,
                  data.investmentReturnRate
                ), [calculations.currentSavings, calculations.rentAndSaveAvailable, data.investmentReturnRate])}
              />
            </div>

            {/* Decision Support */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-4 bg-gray-800 rounded-xl shadow-lg p-8">
                <OptimizationStrategies
                  data={data}
                  calculations={calculations}
                />
              </div>
              <div className="lg:col-span-4 bg-gray-800 rounded-xl shadow-lg p-8">
                <DecisionTimeline
                  data={data}
                  calculations={calculations}
                  savingsProjection={useMemo(() => calculateSavingsProjection(
                    calculations.currentSavings,
                    600000,
                    calculations.rentAndSaveAvailable,
                    data.investmentReturnRate
                  ), [calculations.currentSavings, calculations.rentAndSaveAvailable, data.investmentReturnRate])}
                />
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <LoanChart data={data} calculations={calculations} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
