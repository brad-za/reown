export interface SavingsProjection {
    monthlyContribution: number
    targetAmount: number
    expectedReturn: number // annual percentage
    inflationRate?: number // annual percentage
    timeToTarget: number // in months
    totalContributions: number
    totalReturns: number
    monthlyBreakdown: Array<{
        month: number
        balance: number
        contribution: number
        returns: number
    }>
}

export function calculateSavingsProjection(params: {
    monthlyContribution: number
    targetAmount: number
    expectedReturn: number
    inflationRate?: number
}): SavingsProjection {
    const { monthlyContribution, targetAmount, expectedReturn, inflationRate = 6 } = params
    const monthlyReturn = (1 + expectedReturn / 100) ** (1 / 12) - 1
    const monthlyInflation = (1 + inflationRate / 100) ** (1 / 12) - 1
    const realMonthlyReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1

    let balance = 0
    let month = 0
    const monthlyBreakdown: SavingsProjection['monthlyBreakdown'] = []

    while (balance < targetAmount && month < 600) { // 50 years max
        const returns = balance * realMonthlyReturn
        balance += monthlyContribution + returns
        month++

        monthlyBreakdown.push({
            month,
            balance,
            contribution: monthlyContribution,
            returns
        })
    }

    const totalContributions = monthlyContribution * month
    const totalReturns = balance - totalContributions

    return {
        monthlyContribution,
        targetAmount,
        expectedReturn,
        inflationRate,
        timeToTarget: month,
        totalContributions,
        totalReturns,
        monthlyBreakdown
    }
}
