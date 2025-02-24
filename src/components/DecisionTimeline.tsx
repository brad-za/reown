import { DashboardData, PropertyCalculations, SavingsProjection } from '../types/dashboard'
import { formatMoney, formatPercentage } from '../utils/calculations'

interface DecisionTimelineProps {
    data: DashboardData
    calculations: PropertyCalculations
    savingsProjection: SavingsProjection
}

interface TimelineEvent {
    month: number
    title: string
    description: string
    type: 'milestone' | 'warning' | 'opportunity'
    value?: number
}

function calculateBreakEvenPoint(
    monthlyPayment: number,
    rentalIncome: number,
    propertyLevies: number,
    appreciationRate: number,
    propertyValue: number
): number {
    const monthlyShortfall = monthlyPayment + propertyLevies - rentalIncome
    const monthlyAppreciation = (propertyValue * appreciationRate) / 12

    // If rental covers costs, break-even is immediate
    if (monthlyShortfall <= 0) return 0

    // Calculate months until appreciation covers accumulated shortfall
    let accumulatedShortfall = 0
    let accumulatedAppreciation = 0
    let months = 0

    while (accumulatedAppreciation < accumulatedShortfall && months < 120) { // Cap at 10 years
        accumulatedShortfall += monthlyShortfall
        accumulatedAppreciation += monthlyAppreciation
        months++
    }

    return months
}

function calculateTimelineEvents(
    data: DashboardData,
    calculations: PropertyCalculations,
    savingsProjection: SavingsProjection
): TimelineEvent[] {
    const events: TimelineEvent[] = []
    const annualAppreciation = 0.05 // 5% annual property appreciation

    // Savings milestones
    savingsProjection.milestones.forEach(milestone => {
        if (milestone.standardAmount >= data.downPayment) {
            events.push({
                month: milestone.month,
                title: 'Down Payment Target',
                description: 'Savings reach required down payment amount',
                type: 'milestone',
                value: milestone.standardAmount
            })
        }
    })

    // Break-even point for rental scenario
    const breakEvenMonths = calculateBreakEvenPoint(
        calculations.monthlyBondPayment,
        data.rentalIncome,
        data.propertyLevies,
        annualAppreciation,
        data.housePrice
    )

    if (breakEvenMonths < 120) {
        events.push({
            month: breakEvenMonths,
            title: 'Rental Break-Even',
            description: 'Property appreciation covers accumulated shortfall',
            type: 'milestone',
            value: data.housePrice * Math.pow(1 + annualAppreciation, breakEvenMonths / 12)
        })
    }

    // Interest rate risk points
    const rateRiskMonths = Math.ceil(calculations.currentSavings / calculations.monthlySavings)
    if (rateRiskMonths < 24) {
        events.push({
            month: 24,
            title: 'Interest Rate Risk',
            description: 'Consider locking in rate before potential increases',
            type: 'warning'
        })
    }

    // Market timing factors
    events.push({
        month: 6,
        title: 'Market Analysis Point',
        description: 'Evaluate property market trends and price movements',
        type: 'opportunity'
    })

    // Sort events by month
    return events.sort((a, b) => a.month - b.month)
}

function TimelinePoint({ event, isLast }: { event: TimelineEvent, isLast: boolean }) {
    const colors = {
        milestone: 'bg-green-500',
        warning: 'bg-red-500',
        opportunity: 'bg-blue-500'
    }

    return (
        <div className="relative">
            <div className={`w-4 h-4 rounded-full ${colors[event.type]} absolute left-0 top-0 transform -translate-x-1/2`}></div>
            {!isLast && <div className="absolute left-0 top-4 bottom-0 w-px bg-gray-700 transform -translate-x-1/2"></div>}
            <div className="ml-6 pb-8">
                <div className="flex items-baseline">
                    <div className="text-sm font-medium text-gray-200">Month {event.month}</div>
                    <div className="ml-4 text-xs text-gray-500">
                        {event.month <= 12 ?
                            `(${event.month} months)` :
                            `(${(event.month / 12).toFixed(1)} years)`}
                    </div>
                </div>
                <div className="text-lg font-medium text-gray-100 mt-1">{event.title}</div>
                <div className="text-sm text-gray-400 mt-1">{event.description}</div>
                {event.value !== undefined && (
                    <div className="text-sm text-gray-300 mt-1">
                        Value: {formatMoney(event.value)}
                    </div>
                )}
            </div>
        </div>
    )
}

export function DecisionTimeline({ data, calculations, savingsProjection }: DecisionTimelineProps) {
    const events = calculateTimelineEvents(data, calculations, savingsProjection)

    return (
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-purple-400">Decision Timeline</h2>

            <div className="relative pl-8">
                {events.map((event, index) => (
                    <TimelinePoint
                        key={index}
                        event={event}
                        isLast={index === events.length - 1}
                    />
                ))}
            </div>

            <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Timeline Legend</div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-300">Financial Milestone</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-300">Risk Point</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-300">Opportunity</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
