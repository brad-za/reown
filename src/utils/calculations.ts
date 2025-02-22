import { DashboardData, PropertyCalculations } from '../types/dashboard'
import { calculateSavingsProjection } from '../types/savings'

export function calculateAll(data: DashboardData): PropertyCalculations {
    // Basic calculations
    const loanAmount = data.housePrice - data.downPayment
    const interestRate = data.primeRate + data.premiumAbovePrime
    const monthlyInterestRate = interestRate / 100 / 12
    const totalPayments = data.loanTermYears * 12
    const totalMonthlyIncome = data.monthlyIncomeZAR + (data.monthlyIncomeUSD * data.exchangeRate)

    // Monthly bond payment calculation
    const monthlyBondPayment = loanAmount *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)

    // Property expenses
    const propertyExpenses = data.propertyLevies

    // Tax calculation (2024/2025 tax tables)
    const annualIncome = totalMonthlyIncome * 12
    const primaryRebate = 17235 // Primary rebate for 2024/2025
    let taxBeforeRebate = 0

    // Calculate tax based on annual income brackets
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

    // Apply rebate and convert to monthly
    const annualTaxAfterRebate = Math.max(0, taxBeforeRebate - primaryRebate)
    const monthlyTax = annualTaxAfterRebate / 12
    const monthlyNetIncome = totalMonthlyIncome - monthlyTax

    // Available acceleration amounts for different scenarios
    // 1. Buy and Live In (standard)
    const standardAvailable = monthlyNetIncome - monthlyBondPayment - propertyExpenses - data.personalAllocation

    // 2. Buy and Rent Out (while renting elsewhere)
    const rentOutAvailable = (totalMonthlyIncome + data.rentalIncome) - monthlyTax -
        monthlyBondPayment - propertyExpenses - (data.monthlyRent || 0) - data.personalAllocation - data.personalExpenses

    // 3. Rent and Save
    const rentAndSaveAvailable = monthlyNetIncome - (data.monthlyRent || 0) - data.personalAllocation

    // Calculate loan terms and savings for each scenario
    function calculateScenarioImpact(monthlyAcceleration: number) {
        if (monthlyAcceleration <= 0) return {
            newTerm: totalPayments,
            interestSaved: 0,
            timeSaved: 0
        }

        let balance = loanAmount
        let months = 0
        while (balance > 0 && months < 360) {
            const interestPayment = balance * monthlyInterestRate
            const principalPayment = monthlyBondPayment - interestPayment
            balance -= (principalPayment + monthlyAcceleration)
            months++
            if (balance <= 0) break
        }

        const originalInterest = (monthlyBondPayment * totalPayments) - loanAmount
        const newInterest = (monthlyBondPayment * months) - loanAmount
        const interestSaved = originalInterest - newInterest
        const timeSaved = data.loanTermYears - (months / 12)

        return { newTerm: months, interestSaved, timeSaved }
    }

    const standardScenario = calculateScenarioImpact(standardAvailable)
    const rentOutScenario = calculateScenarioImpact(rentOutAvailable)

    // Calculate ratios
    const bondToGrossIncomeRatio = (monthlyBondPayment / totalMonthlyIncome) * 100
    const bondToNetIncomeRatio = (monthlyBondPayment / monthlyNetIncome) * 100

    // Additional metrics
    const accelerationMultiplier = rentOutAvailable / standardAvailable
    const timeSaved = rentOutScenario.timeSaved
    const additionalInterestSaved = rentOutScenario.interestSaved - standardScenario.interestSaved

    // Calculate rent & save projections
    const annualReturnRate = data.investmentReturnRate / 100
    const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1 / 12) - 1

    // Function to calculate future value with monthly contributions
    function calculateFutureValue(monthlyContribution: number, months: number): number {
        return monthlyContribution * (Math.pow(1 + monthlyReturnRate, months) - 1) / monthlyReturnRate
    }

    // Function to calculate time to reach target with monthly contributions
    function calculateTimeToTarget(target: number, monthlyContribution: number): number {
        return Math.log(target * monthlyReturnRate / monthlyContribution + 1) / Math.log(1 + monthlyReturnRate)
    }

    // Calculate savings projections
    const monthsToGoal = calculateTimeToTarget(data.downPayment, rentAndSaveAvailable)
    const yearsToGoal = monthsToGoal / 12

    // Calculate 5-year projection
    const fiveYearTotal = calculateFutureValue(rentAndSaveAvailable, 60)
    const fiveYearContributions = rentAndSaveAvailable * 60
    const fiveYearReturns = fiveYearTotal - fiveYearContributions

    // Calculate required monthly savings for different timeframes
    const requiredMonthly3Years = data.downPayment / (36 * (1 + (annualReturnRate * 3) / 2))
    const requiredMonthly5Years = data.downPayment / (60 * (1 + (annualReturnRate * 5) / 2))

    // Estimate future costs (assuming 6% annual inflation)
    const inflationRate = 0.06
    const futureHousePrice = data.housePrice * Math.pow(1 + inflationRate, yearsToGoal)
    const futureDownPayment = data.downPayment * Math.pow(1 + inflationRate, yearsToGoal)

    const rentAndSave = {
        monthlyAvailable: rentAndSaveAvailable,
        timeToDownPayment: monthsToGoal,
        yearsToGoal: yearsToGoal,
        fiveYearTotal: fiveYearTotal,
        fiveYearReturns: fiveYearReturns,
        requiredMonthly3Years: requiredMonthly3Years,
        requiredMonthly5Years: requiredMonthly5Years,
        progressToGoal: (fiveYearTotal / data.downPayment) * 100,
        futureHousePrice: futureHousePrice,
        futureDownPayment: futureDownPayment,
        effectiveReturn: ((fiveYearTotal / fiveYearContributions - 1) * 100) / 5 // Annualized return
    }

    return {
        loanAmount,
        interestRate,
        monthlyBondPayment,
        propertyExpenses,
        totalMonthlyIncome,
        monthlyTax,
        monthlyNetIncome,
        standardAvailable,
        rentOutAvailable,
        rentAndSaveAvailable,
        accelerationMultiplier,
        bondToGrossIncomeRatio,
        bondToNetIncomeRatio,
        standardScenario,
        rentOutScenario,
        timeSaved,
        additionalInterestSaved,
        rentAndSave
    }
}

export function formatMoney(amount: number): string {
    return `R${amount.toLocaleString()}`
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
}

// Helper function to generate data points for visualization
export function generateVisualizationData(data: DashboardData, calculations: PropertyCalculations) {
    const months = data.loanTermYears * 12
    const monthlyRate = calculations.interestRate / 100 / 12
    const points = []

    let standardLoanBalance = calculations.loanAmount
    let standardAccelBalance = calculations.loanAmount
    let rentOutBalance = calculations.loanAmount

    for (let month = 0; month <= months; month++) {
        // Standard loan (no acceleration)
        const standardInterest = standardLoanBalance * monthlyRate
        const standardPrincipal = calculations.monthlyBondPayment - standardInterest
        standardLoanBalance = Math.max(0, standardLoanBalance - standardPrincipal)

        // Buy and Live In (with acceleration)
        const standardAccelInterest = standardAccelBalance * monthlyRate
        const standardAccelPrincipal = calculations.monthlyBondPayment - standardAccelInterest
        standardAccelBalance = Math.max(0, standardAccelBalance - (standardAccelPrincipal + calculations.standardAvailable))

        // Buy and Rent Out
        const rentOutInterest = rentOutBalance * monthlyRate
        const rentOutPrincipal = calculations.monthlyBondPayment - rentOutInterest
        rentOutBalance = Math.max(0, rentOutBalance - (rentOutPrincipal + calculations.rentOutAvailable))

        points.push({
            month,
            standardLoanBalance,
            standardAccelBalance,
            rentOutBalance
        })
    }

    return points
}
