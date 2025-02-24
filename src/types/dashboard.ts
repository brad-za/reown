// Income and Tax Types
export interface TaxBracket {
    threshold: number
    rate: number
    amount: number
}

export interface TaxCalculation {
    annualGross: number
    brackets: TaxBracket[]
    rebate: number
    monthlyTax: number
    effectiveRate: number
}

export interface IncomeBreakdown {
    zarIncome: number
    usdIncome: number
    usdAmount: number
    exchangeRate: number
    totalGross: number
    taxCalculation: TaxCalculation
    netIncome: number
}

// Scenario Analysis Types
export interface RentalScenario {
    grossRental: number
    vacancy: number
    maintenance: number
    netRental: number
}

export interface PropertyCosts {
    bondPayment: number
    levies: number
    total: number
}

export interface PersonalCosts {
    rental: number
    expenses: number
    allocation: number
    total: number
}

export interface ScenarioAnalysis {
    incomeStreams: {
        employment: IncomeBreakdown
        rental?: RentalScenario
    }
    costs: {
        property?: PropertyCosts
        personal: PersonalCosts
    }
    netAvailable: number
}

// Timeline Projection Types
export interface LoanProjection {
    original: {
        totalInterest: number
        totalPayments: number
        term: number
    }
    accelerated: {
        totalInterest: number
        totalPayments: number
        newTerm: number
        yearsSaved: number
        interestSaved: number
    }
}

export interface SavingsMilestone {
    month: number
    standardAmount: number
    withReturns: number
}

export interface SavingsProjection {
    current: number
    target: number
    monthlyContribution: number
    monthsToTarget: {
        standard: number
        withReturns: number
    }
    milestones: SavingsMilestone[]
}

// Sensitivity Analysis Types
export interface RentalSensitivity {
    variation: number
    income: number
    available: number
    timeImpact: number
}

export interface VacancyImpact {
    months: number
    lostIncome: number
    monthlyImpact: number
    newAvailable: number
}

export interface ExchangeRateImpact {
    rate: number
    zarValue: number
    netChange: number
    newAvailable: number
}

export interface IncomeSensitivity {
    amount: number
    zarValue: number
    newAvailable: number
}

export interface SensitivityAnalysis {
    rental: {
        baseIncome: number
        variations: RentalSensitivity[]
        vacancy: VacancyImpact[]
    }
    income: {
        exchangeRate: ExchangeRateImpact[]
        usdIncome: IncomeSensitivity[]
    }
}

// Base Data Interface
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
    investmentReturnRate: number

    // Monthly expenses
    personalAllocation: number
    personalExpenses: number
    propertyLevies: number

    // Savings details
    currentSavings?: number
    targetDownPayment?: number
    monthlySavings?: number
}

// Calculations Interface
export interface PropertyCalculations {
    // Basic metrics
    totalMonthlyIncome: number
    monthlyNetIncome: number
    monthlyTax: number
    loanAmount: number
    monthlyBondPayment: number
    totalHousingCost: number

    // Affordability metrics
    housingToIncomeRatio: number
    disposableAfterHousing: number
    affordabilityStatus: string

    // Savings progress
    currentSavings: number
    monthsToTarget: number
    projectedDate: Date
    downPaymentShortfall: number
    monthlySavings: number

    // Living costs
    currentRent: number

    // Scenario details
    standardAvailable: number
    rentOutAvailable: number
    rentAndSaveAvailable: number
}
