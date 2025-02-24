import {
    DashboardData,
    PropertyCalculations,
    TaxCalculation,
    TaxBracket,
    IncomeBreakdown,
    LoanProjection,
    SavingsProjection,
    SavingsMilestone,
    SensitivityAnalysis,
    ScenarioAnalysis,
    RentalSensitivity,
    VacancyImpact,
    ExchangeRateImpact,
    IncomeSensitivity
} from '../types/dashboard'

// Tax calculation helper
export function calculateTaxBreakdown(annualIncome: number): TaxCalculation {
    const primaryRebate = 17235
    const brackets: TaxBracket[] = [
        { threshold: 0, rate: 18, amount: 0 },
        { threshold: 237100, rate: 26, amount: 42678 },
        { threshold: 370500, rate: 31, amount: 77362 },
        { threshold: 512800, rate: 36, amount: 121475 },
        { threshold: 673000, rate: 39, amount: 179147 },
        { threshold: 857900, rate: 41, amount: 251258 },
        { threshold: 1817000, rate: 45, amount: 644489 }
    ]

    let taxBeforeRebate = 0
    const applicableBracket = brackets.reverse().find(b => annualIncome > b.threshold)

    if (applicableBracket) {
        const baseAmount = applicableBracket.amount
        const excessAmount = annualIncome - applicableBracket.threshold
        taxBeforeRebate = baseAmount + (excessAmount * (applicableBracket.rate / 100))
    }

    const annualTaxAfterRebate = Math.max(0, taxBeforeRebate - primaryRebate)
    const monthlyTax = annualTaxAfterRebate / 12
    const effectiveRate = (annualTaxAfterRebate / annualIncome) * 100

    return {
        annualGross: annualIncome,
        brackets: brackets.reverse(),
        rebate: primaryRebate,
        monthlyTax,
        effectiveRate
    }
}

// Income breakdown calculation
export function calculateIncomeBreakdown(data: DashboardData): IncomeBreakdown {
    const zarIncome = data.monthlyIncomeZAR
    const usdAmount = data.monthlyIncomeUSD
    const exchangeRate = data.exchangeRate
    const usdIncome = usdAmount * exchangeRate
    const totalGross = zarIncome + usdIncome
    const taxCalculation = calculateTaxBreakdown(totalGross * 12)
    const netIncome = totalGross - taxCalculation.monthlyTax

    return {
        zarIncome,
        usdIncome,
        usdAmount,
        exchangeRate,
        totalGross,
        taxCalculation,
        netIncome
    }
}

// Loan projection calculation
export function calculateLoanProjection(
    loanAmount: number,
    interestRate: number,
    termYears: number,
    extraPayment: number
): LoanProjection {
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = termYears * 12
    const MAX_ITERATIONS = totalMonths * 2 // Safety limit

    // Calculate standard payment
    const monthlyPayment = loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)

    // Original loan calculations
    const originalTotalPayments = monthlyPayment * totalMonths
    const originalTotalInterest = originalTotalPayments - loanAmount

    // Validate minimum payment
    const minPayment = loanAmount * monthlyRate // Minimum to cover interest
    if (monthlyPayment + extraPayment <= minPayment) {
        return {
            original: {
                totalInterest: originalTotalInterest,
                totalPayments: originalTotalPayments,
                term: totalMonths
            },
            accelerated: {
                totalInterest: originalTotalInterest,
                totalPayments: originalTotalPayments,
                newTerm: totalMonths,
                yearsSaved: 0,
                interestSaved: 0
            }
        }
    }

    // Accelerated loan calculations
    let balance = loanAmount
    let months = 0
    let totalInterest = 0
    let lastBalance = balance
    let stuckCount = 0

    while (balance > 0 && months < MAX_ITERATIONS) {
        const interestPayment = balance * monthlyRate
        totalInterest += interestPayment
        const principalPayment = monthlyPayment + extraPayment - interestPayment
        balance -= principalPayment

        // Check if we're stuck (balance not decreasing meaningfully)
        if (Math.abs(balance - lastBalance) < 0.01) {
            stuckCount++
            if (stuckCount > 3) break; // Exit if stuck for too long
        } else {
            stuckCount = 0
        }
        lastBalance = balance
        months++
    }

    // If we hit the safety limit, return original projection
    if (months >= MAX_ITERATIONS || stuckCount > 3) {
        return {
            original: {
                totalInterest: originalTotalInterest,
                totalPayments: originalTotalPayments,
                term: totalMonths
            },
            accelerated: {
                totalInterest: originalTotalInterest,
                totalPayments: originalTotalPayments,
                newTerm: totalMonths,
                yearsSaved: 0,
                interestSaved: 0
            }
        }
    }

    return {
        original: {
            totalInterest: originalTotalInterest,
            totalPayments: originalTotalPayments,
            term: totalMonths
        },
        accelerated: {
            totalInterest,
            totalPayments: totalInterest + loanAmount,
            newTerm: months,
            yearsSaved: (totalMonths - months) / 12,
            interestSaved: originalTotalInterest - totalInterest
        }
    }
}

// Savings projection with investment returns
export function calculateSavingsProjection(
    current: number,
    target: number,
    monthlyContribution: number,
    annualReturn: number
): SavingsProjection {
    const monthlyReturn = annualReturn / 12 / 100
    const milestones: SavingsMilestone[] = []

    let standardAmount = current
    let withReturns = current
    let monthsToTargetStandard = 0
    let monthsToTargetWithReturns = 0

    for (let month = 0; month <= 60; month++) { // Project up to 5 years
        if (standardAmount < target) {
            standardAmount += monthlyContribution
            monthsToTargetStandard = month + 1
        }

        if (withReturns < target) {
            withReturns = withReturns * (1 + monthlyReturn) + monthlyContribution
            monthsToTargetWithReturns = month + 1
        }

        if (month % 12 === 0 || standardAmount >= target || withReturns >= target) {
            milestones.push({
                month,
                standardAmount,
                withReturns
            })
        }
    }

    return {
        current,
        target,
        monthlyContribution,
        monthsToTarget: {
            standard: monthsToTargetStandard,
            withReturns: monthsToTargetWithReturns
        },
        milestones
    }
}

// Simplified time impact calculation
function estimateTimeImpact(
    loanAmount: number,
    monthlyPayment: number,
    extraPayment: number,
    interestRate: number,
    originalTerm: number
): number {
    const monthlyRate = interestRate / 100 / 12

    // Estimate using payment ratio
    const totalPayment = monthlyPayment + extraPayment
    const paymentRatio = totalPayment / monthlyPayment

    if (paymentRatio <= 1) return 0

    // Rough estimation based on payment increase
    const estimatedTerm = originalTerm / paymentRatio
    return (originalTerm - estimatedTerm) / 12
}

// Sensitivity analysis calculations
export function calculateSensitivityAnalysis(data: DashboardData, baseCalculations: PropertyCalculations): SensitivityAnalysis {
    const baseRental = data.rentalIncome
    const interestRate = data.primeRate + data.premiumAbovePrime
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = data.loanTermYears * 12

    // Calculate base monthly payment once
    const baseMonthlyPayment = baseCalculations.loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)

    // Calculate rental variations
    const variations: RentalSensitivity[] = [-15, -10, -5, 0, 5, 10, 15].map(percent => {
        const variation = percent / 100
        const income = baseRental * (1 + variation)
        const available = baseCalculations.rentOutAvailable + (income - baseRental)
        const extraPayment = available - baseCalculations.rentOutAvailable

        const timeImpact = estimateTimeImpact(
            baseCalculations.loanAmount,
            baseMonthlyPayment,
            extraPayment,
            interestRate,
            totalMonths
        )

        return {
            variation: percent,
            income,
            available,
            timeImpact
        }
    })

    // Calculate vacancy impact
    const vacancy: VacancyImpact[] = [1, 2].map(months => {
        const lostIncome = baseRental * months
        const monthlyImpact = lostIncome / 12
        return {
            months,
            lostIncome,
            monthlyImpact,
            newAvailable: baseCalculations.rentOutAvailable - monthlyImpact
        }
    })

    // Calculate exchange rate impact
    const baseRate = data.exchangeRate
    const exchangeRate: ExchangeRateImpact[] = [
        { rate: baseRate * 0.9 },
        { rate: baseRate * 0.95 },
        { rate: baseRate },
        { rate: baseRate * 1.05 },
        { rate: baseRate * 1.1 }
    ].map(({ rate }) => {
        const zarValue = data.monthlyIncomeUSD * rate
        const netChange = zarValue - (data.monthlyIncomeUSD * baseRate)
        return {
            rate,
            zarValue,
            netChange,
            newAvailable: baseCalculations.rentOutAvailable + netChange
        }
    })

    // Calculate USD income variations
    const baseUSD = data.monthlyIncomeUSD
    const usdIncome: IncomeSensitivity[] = [-10, -5, 0, 5, 10].map(percent => {
        const amount = baseUSD * (1 + percent / 100)
        const zarValue = amount * data.exchangeRate
        return {
            amount,
            zarValue,
            newAvailable: baseCalculations.rentOutAvailable + (zarValue - (baseUSD * data.exchangeRate))
        }
    })

    return {
        rental: {
            baseIncome: baseRental,
            variations,
            vacancy
        },
        income: {
            exchangeRate,
            usdIncome
        }
    }
}

export function calculateAll(data: DashboardData): PropertyCalculations {
    // Income calculations
    const totalMonthlyIncome = data.monthlyIncomeZAR + (data.monthlyIncomeUSD * data.exchangeRate)

    // Tax calculation (2024/2025 tax tables)
    const annualIncome = totalMonthlyIncome * 12
    const primaryRebate = 17235
    let taxBeforeRebate = 0

    if (annualIncome <= 237100) {
        taxBeforeRebate = annualIncome * 0.18
    } else if (annualIncome <= 370500) {
        taxBeforeRebate = 42678 + (annualIncome - 237100) * 0.26
    } else if (annualIncome <= 512800) {
        taxBeforeRebate = 77362 + (annualIncome - 370500) * 0.31
    } else if (annualIncome <= 673000) {
        taxBeforeRebate = 121475 + (annualIncome - 512800) * 0.36
    } else if (annualIncome <= 857900) {
        taxBeforeRebate = 179147 + (annualIncome - 673000) * 0.39
    } else if (annualIncome <= 1817000) {
        taxBeforeRebate = 251258 + (annualIncome - 857900) * 0.41
    } else {
        taxBeforeRebate = 644489 + (annualIncome - 1817000) * 0.45
    }

    const annualTaxAfterRebate = Math.max(0, taxBeforeRebate - primaryRebate)
    const monthlyTax = annualTaxAfterRebate / 12
    const monthlyNetIncome = totalMonthlyIncome - monthlyTax

    // Property calculations
    const loanAmount = data.housePrice - data.downPayment
    const interestRate = data.primeRate + data.premiumAbovePrime
    const monthlyInterestRate = interestRate / 100 / 12
    const totalPayments = data.loanTermYears * 12

    // Monthly bond payment
    const monthlyBondPayment = loanAmount *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)

    // Total monthly housing costs
    const totalHousingCost = monthlyBondPayment + data.propertyLevies

    // Affordability metrics
    const housingToIncomeRatio = (totalHousingCost / monthlyNetIncome) * 100
    const disposableAfterHousing = monthlyNetIncome - totalHousingCost - data.personalExpenses
    const affordabilityStatus = housingToIncomeRatio <= 30 ? 'Good' : housingToIncomeRatio <= 40 ? 'Moderate' : 'High'

    // Current situation
    const currentRent = data.monthlyRent || 0
    const monthlySavings = monthlyNetIncome - currentRent - data.personalExpenses - data.personalAllocation
    const currentSavings = data.currentSavings || 0
    const targetAmount = data.downPayment // Use the desired down payment as target
    const remainingAmount = targetAmount - currentSavings
    const monthsToTarget = Math.ceil(remainingAmount / monthlySavings)
    const projectedDate = new Date()
    projectedDate.setMonth(projectedDate.getMonth() + monthsToTarget)
    const downPaymentShortfall = targetAmount - currentSavings

    // Calculate available money in different scenarios
    const standardAvailable = monthlyNetIncome - totalHousingCost - data.personalExpenses - data.personalAllocation
    const rentOutAvailable = monthlyNetIncome + data.rentalIncome - totalHousingCost - data.personalExpenses - data.personalAllocation - currentRent
    const rentAndSaveAvailable = monthlyNetIncome - currentRent - data.personalExpenses - data.personalAllocation

    // Calculate key metrics
    const rentalYield = (data.rentalIncome * 12 / data.housePrice) * 100
    const bondCoverage = (data.rentalIncome / monthlyBondPayment) * 100
    const usdDependence = ((data.monthlyIncomeUSD * data.exchangeRate) / totalMonthlyIncome) * 100
    const interestSensitivity = loanAmount * (0.02 / 100) / 12 // Impact of 2% rate increase

    return {
        // Basic metrics
        totalMonthlyIncome,
        monthlyNetIncome,
        monthlyTax,
        loanAmount,
        monthlyBondPayment,
        totalHousingCost,

        // Affordability metrics
        housingToIncomeRatio,
        disposableAfterHousing,
        affordabilityStatus,

        // Savings progress
        currentSavings,
        monthsToTarget,
        projectedDate,
        downPaymentShortfall,

        // Living costs
        currentRent,

        // Monthly savings
        monthlySavings,

        // Scenario details
        standardAvailable,
        rentOutAvailable,
        rentAndSaveAvailable
    }
}

export function formatMoney(amount: number): string {
    return `R${amount.toLocaleString()}`
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
}

// Helper function to generate savings projection data
export interface VisualizationPoint {
    month: number
    savingsBalance: number
    targetAmount: number
    monthlyContribution: number
}

export function generateVisualizationData(data: DashboardData, calculations: PropertyCalculations): VisualizationPoint[] {
    const points: VisualizationPoint[] = []
    const monthsToProject = calculations.monthsToTarget

    let savingsBalance = calculations.currentSavings
    for (let month = 0; month <= monthsToProject; month++) {
        savingsBalance += calculations.monthlySavings

        points.push({
            month,
            savingsBalance,
            targetAmount: data.downPayment,
            monthlyContribution: calculations.monthlySavings
        })
    }

    return points
}
