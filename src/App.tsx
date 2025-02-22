import { useState, useMemo, useEffect } from 'react'
import { DashboardData } from './types/dashboard'
import { calculateAll, formatMoney, formatPercentage } from './utils/calculations'
import { InputPanel } from './components/InputPanel'
import { CashFlowCards } from './components/CashFlowCards'
import { LoanChart } from './components/LoanChart'
import { ScenarioComparison } from './components/ScenarioComparison'

const defaultData: DashboardData = {
  // Property details
  housePrice: 2500000,
  downPayment: 500000,
  primeRate: 11.75,
  premiumAbovePrime: 2,
  loanTermYears: 20,

  // Income & expenses
  monthlyIncomeZAR: 45000,
  monthlyIncomeUSD: 2000,
  exchangeRate: 18.5,
  rentalIncome: 18000,
  monthlyRent: 12000,

  // Investment settings
  investmentReturnRate: 8, // 8% annual return

  // Monthly expenses
  personalAllocation: 15000,
  personalExpenses: 8000,
  propertyLevies: 3000
}

function App() {
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
    <div className="min-h-screen bg-gray-900 py-8 text-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">🏠 Property Financial Analysis</h1>

        {/* Info Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-2">Buy and Live In</h3>
              <p className="text-gray-300">Purchase the property with current down payment and live in it. Use extra cash to accelerate bond repayment.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-2">Buy and Rent Out</h3>
              <p className="text-gray-300">Buy the property but rent it out while renting elsewhere yourself. Use rental income to accelerate bond repayment.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">Rent and Save</h3>
              <p className="text-gray-300">Rent a property while saving and investing for a larger down payment. Buy later with better loan terms.</p>
            </div>
          </div>
        </div>

        {/* Input Panel */}
        <InputPanel data={data} onChange={handleDataChange} />

        {/* Cash Flow Analysis */}
        <CashFlowCards data={data} calculations={calculations} />

        {/* Scenario Comparison */}
        <ScenarioComparison data={data} calculations={calculations} />

        {/* Visualization */}
        <LoanChart data={data} calculations={calculations} />

      </div>
    </div>
  )
}

export default App
