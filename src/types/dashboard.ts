export interface DashboardData {
    // Property details
    housePrice: number
    downPayment: number
    primeRate: number
    premiumAbovePrime: number
    loanTermYears: number
    monthlyIncomeZAR: number
    monthlyIncomeUSD: number
    exchangeRate: number
    rentalIncome: number
    monthlyRent?: number

    // Investment settings
    investmentReturnRate: number // Annual return rate as percentage

    // Monthly expenses
    personalAllocation: number
    personalExpenses: number
    propertyLevies: number
}

interface ScenarioImpact {
    newTerm: number
    interestSaved: number
    timeSaved: number
}

interface RentAndSaveProjection {
    monthlyAvailable: number
    timeToDownPayment: number
    yearsToGoal: number
    fiveYearTotal: number
    fiveYearReturns: number
    requiredMonthly3Years: number
    requiredMonthly5Years: number
    progressToGoal: number
    futureHousePrice: number
    futureDownPayment: number
    effectiveReturn: number
}

export interface PropertyCalculations {
    // Basic calculations
    loanAmount: number
    interestRate: number
    monthlyBondPayment: number
    propertyExpenses: number
    totalMonthlyIncome: number
    monthlyTax: number
    monthlyNetIncome: number

    // Available amounts for each scenario
    standardAvailable: number // Buy and live in
    rentOutAvailable: number // Buy and rent out (while renting elsewhere)
    rentAndSaveAvailable: number // Rent and save for bigger down payment

    // Scenario impacts
    standardScenario: ScenarioImpact
    rentOutScenario: ScenarioImpact

    // Ratios and metrics
    accelerationMultiplier: number
    bondToGrossIncomeRatio: number
    bondToNetIncomeRatio: number
    timeSaved: number
    additionalInterestSaved: number

    // Rent and save projections
    rentAndSave: RentAndSaveProjection
}
