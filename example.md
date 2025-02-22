---
house_price: 2000000
down_payment: 600000
prime_rate: 11.5
premium_above_prime: 3
loan_term_years: 20
monthly_income_zar: 10000
monthly_income_usd: 1600
exchange_rate: 18.5
personal_allocation: 10000
rental_income: 11000
---

# 🏠 Property Financial Analysis

```dataviewjs
// Input parameters from frontmatter
const housePrice = dv.current().house_price;
const downPayment = dv.current().down_payment;
const primeRate = dv.current().prime_rate;
const premiumAbovePrime = dv.current().premium_above_prime;
const loanTermYears = dv.current().loan_term_years;
const monthlyIncomeZAR = dv.current().monthly_income_zar;
const monthlyIncomeUSD = dv.current().monthly_income_usd;
const exchangeRate = dv.current().exchange_rate;
const personalAllocation = dv.current().personal_allocation;
const rentalIncome = dv.current().rental_income;

// Derived calculations
const loanAmount = housePrice - downPayment;
const interestRate = primeRate + premiumAbovePrime;
const totalMonthlyIncome = monthlyIncomeZAR + (monthlyIncomeUSD * exchangeRate);

// Calculate monthly bond payment and expenses
const monthlyInterestRate = interestRate / 100 / 12;
const totalPayments = loanTermYears * 12;
const monthlyBondPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
                          (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
const propertyExpenses = (housePrice * 0.001 / 12) + (housePrice * 0.0035 / 12) + (housePrice * 0.01 / 12);

// Tax calculation (2024/2025 tax tables)
const annualIncome = totalMonthlyIncome * 12;
const primaryRebate = 17235;
let taxBeforeRebate;
if (annualIncome <= 237100) {
    taxBeforeRebate = annualIncome * 0.18;
} else if (annualIncome <= 370500) {
    taxBeforeRebate = 42678 + (annualIncome - 237100) * 0.26;
} else if (annualIncome <= 512800) {
    taxBeforeRebate = 77362 + (annualIncome - 370500) * 0.31;
} else if (annualIncome <= 673000) {
    taxBeforeRebate = 121475 + (annualIncome - 512800) * 0.36;
} else if (annualIncome <= 857900) {
    taxBeforeRebate = 179147 + (annualIncome - 673000) * 0.39;
} else if (annualIncome <= 1817000) {
    taxBeforeRebate = 251258 + (annualIncome - 857900) * 0.41;
} else {
    taxBeforeRebate = 644489 + (annualIncome - 1817000) * 0.45;
}
const monthlyTax = Math.max(0, (taxBeforeRebate - primaryRebate)) / 12;

// Calculate rental tax impact
const annualRentalIncome = rentalIncome * 12;
const annualPropertyExpenses = propertyExpenses * 12;
const interestDeduction = loanAmount * (interestRate/100);
const depreciationDeduction = housePrice * 0.05;
const totalDeductions = interestDeduction + annualPropertyExpenses + depreciationDeduction;
// Rental income is fully offset by deductions (taxableRentalIncome = 0)

// Calculate bond-to-income ratios
const monthlyNetIncome = totalMonthlyIncome - monthlyTax;
const bondToGrossIncomeRatio = (monthlyBondPayment / totalMonthlyIncome) * 100;
const bondToNetIncomeRatio = (monthlyBondPayment / monthlyNetIncome) * 100;
const rentalToGrossIncomeRatio = (rentalIncome / totalMonthlyIncome) * 100;
const rentalToNetIncomeRatio = (rentalIncome / monthlyNetIncome) * 100;

// Calculate available acceleration amounts
const withoutRental_Available = monthlyNetIncome - monthlyBondPayment - propertyExpenses - personalAllocation;

const withRental_Available = (totalMonthlyIncome + rentalIncome) - monthlyTax - 
                            monthlyBondPayment - propertyExpenses - personalAllocation;

// Calculate new loan terms
function calculateNewTerm(additionalPayment) {
    if (additionalPayment <= 0) return totalPayments;
    
    const monthlyRate = interestRate / 100 / 12;
    let balance = loanAmount;
    let months = 0;
    
    while (balance > 0 && months < 360) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyBondPayment - interestPayment;
        balance -= (principalPayment + additionalPayment);
        months++;
        if (balance <= 0) break;
    }
    
    return months;
}

const withoutRental_NewTerm = calculateNewTerm(withoutRental_Available);
const withRental_NewTerm = calculateNewTerm(withRental_Available);

// Calculate interest savings
function calculateInterestSaved(newTerm) {
    const originalInterest = (monthlyBondPayment * totalPayments) - loanAmount;
    const newInterest = (monthlyBondPayment * newTerm) - loanAmount;
    return originalInterest - newInterest;
}

const withoutRental_InterestSaved = calculateInterestSaved(withoutRental_NewTerm);
const withRental_InterestSaved = calculateInterestSaved(withRental_NewTerm);

// Format currency
function formatMoney(amount) {
    return "R" + new Intl.NumberFormat('en-ZA').format(Math.round(amount));
}

// Format percentage
function formatPercentage(value) {
    return value.toFixed(2) + "%";
}

// Calculate visualization data
function calculateYearlyData() {
    const years = [];
    let remainingLoanWithRental = loanAmount;
    let remainingLoanWithoutRental = loanAmount;
    
    for (let year = 0; year <= loanTermYears; year++) {
        // Standard remaining balance
        const standardRemainingBalance = year === 0 ? loanAmount :
            loanAmount * (1 - (year / loanTermYears));
            
        // With rental acceleration
        const monthsElapsed = year * 12;
        remainingLoanWithRental = year === 0 ? loanAmount : 
            calculateRemainingBalance(loanAmount, monthlyInterestRate, monthlyBondPayment, withRental_Available, monthsElapsed);
            
        // Without rental acceleration
        remainingLoanWithoutRental = year === 0 ? loanAmount :
            calculateRemainingBalance(loanAmount, monthlyInterestRate, monthlyBondPayment, withoutRental_Available, monthsElapsed);
            
        years.push({
            year,
            standard: standardRemainingBalance,
            withRental: remainingLoanWithRental,
            withoutRental: remainingLoanWithoutRental
        });
        
        // Stop calculation if loans are fully paid
        if (remainingLoanWithRental <= 0 && remainingLoanWithoutRental <= 0) {
            break;
        }
    }
    
    return years;
}

function calculateRemainingBalance(initialLoan, monthlyRate, payment, additionalPayment, months) {
    let balance = initialLoan;
    for (let i = 0; i < months; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(payment - interestPayment, balance);
        balance -= (principalPayment + additionalPayment);
        if (balance <= 0) break;
    }
    return Math.max(0, balance);
}

const yearlyData = calculateYearlyData();

// Colors for dark theme
const colors = {
    background: "#1e1e2e",
    cardBackground: "#252538",
    propertyColor: "#3a5f90",
    propertyLight: "#f0f8ff",
    rentalColor: "#4caf50", 
    rentalLight: "#f0fff0",
    textPrimary: "#ffffff",
    textSecondary: "#aaaaaa",
    accentOrange: "#e67e22",
    accentPurple: "#9b59b6",
    chartGray: "#999999",
    dangerRed: "#e74c3c",
    successGreen: "#2ecc71",
    borderColor: "#444444",
    highlightBackground: "#303045"
};

// ============== RENDER KEY INSIGHTS FIRST ===============
dv.header(1, "Key Insights");

const rentalAdvantage = withRental_InterestSaved - withoutRental_InterestSaved;
const timeDifference = (withoutRental_NewTerm/12 - withRental_NewTerm/12).toFixed(1);
const accelerationMultiplier = (withRental_Available / withoutRental_Available).toFixed(1);
const bondToIncomeChangePercentage = ((withRental_Available / withoutRental_Available) - 1) * 100;

let insightsHTML = `
<div style="margin-bottom: 30px;">
    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; min-width: 180px; background: ${colors.cardBackground}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <div style="font-size: 2em; color: #3a5f90; text-align: center;">${accelerationMultiplier}x</div>
            <div style="font-weight: bold; color: ${colors.textPrimary}; text-align: center; margin: 10px 0;">Acceleration Power Increase</div>
            <div style="text-align: center; color: ${colors.textSecondary};">${formatMoney(withRental_Available)} vs ${formatMoney(withoutRental_Available)}</div>
        </div>
        
        <div style="flex: 1; min-width: 180px; background: ${colors.cardBackground}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <div style="font-size: 2em; color: ${colors.rentalColor}; text-align: center;">${timeDifference}</div>
            <div style="font-weight: bold; color: ${colors.textPrimary}; text-align: center; margin: 10px 0;">Years Saved on Loan Term</div>
            <div style="text-align: center; color: ${colors.textSecondary};">${(withRental_NewTerm/12).toFixed(1)} vs ${(withoutRental_NewTerm/12).toFixed(1)} years</div>
        </div>
        
        <div style="flex: 1; min-width: 180px; background: ${colors.cardBackground}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <div style="font-size: 2em; color: ${colors.accentOrange}; text-align: center;">${formatMoney(rentalAdvantage)}</div>
            <div style="font-weight: bold; color: ${colors.textPrimary}; text-align: center; margin: 10px 0;">Additional Interest Saved</div>
            <div style="text-align: center; color: ${colors.textSecondary};">${formatPercentage(bondToIncomeChangePercentage)} increase</div>
        </div>
        
        <div style="flex: 1; min-width: 180px; background: ${colors.cardBackground}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <div style="font-size: 2em; color: ${colors.accentPurple}; text-align: center;">${(withRental_NewTerm/12).toFixed(1)}</div>
            <div style="font-weight: bold; color: ${colors.textPrimary}; text-align: center; margin: 10px 0;">Years to Full Ownership</div>
            <div style="text-align: center; color: ${colors.textSecondary};">vs original ${loanTermYears} years</div>
        </div>
    </div>
</div>`;

dv.paragraph(insightsHTML);

// 1. Property Details Dashboard
dv.header(1, "Property Details");

// Property Dashboard with visual styling
let dashboardHTML = `
<div style="display: flex; gap: 20px; margin-bottom: 30px;">
    <!-- Property Details -->
    <div style="flex: 1; border: 1px solid ${colors.propertyColor}; border-radius: 8px; padding: 20px; background: ${colors.cardBackground};">
        <h3 style="text-align: center; color: #ADD8E6; margin-top: 0;">Property Investment</h3>
        <div style="display: flex; margin: 15px 0; color: ${colors.textPrimary};">
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Purchase Price</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(housePrice)}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Down Payment</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(downPayment)}</div>
            </div>
        </div>
        <div style="display: flex; margin: 15px 0; color: ${colors.textPrimary};">
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Loan Amount</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(loanAmount)}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Interest Rate</div>
                <div style="font-size: 1.2em; font-weight: bold;">${interestRate}%</div>
                <div style="font-size: 0.8em; color: ${colors.textSecondary};">(Prime ${primeRate}% + ${premiumAbovePrime}%)</div>
            </div>
        </div>
    </div>
    
    <!-- Income & Expenses -->
    <div style="flex: 1; border: 1px solid ${colors.rentalColor}; border-radius: 8px; padding: 20px; background: ${colors.cardBackground};">
        <h3 style="text-align: center; color: #90EE90; margin-top: 0;">Monthly Finances</h3>
        <div style="display: flex; margin: 15px 0; color: ${colors.textPrimary};">
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Monthly Income</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(totalMonthlyIncome)}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Rental Income</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(rentalIncome)}</div>
            </div>
        </div>
        <div style="display: flex; margin: 15px 0; color: ${colors.textPrimary};">
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Monthly Bond Payment</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(monthlyBondPayment)}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.9em; color: ${colors.textSecondary};">Property Expenses</div>
                <div style="font-size: 1.2em; font-weight: bold;">${formatMoney(propertyExpenses)}</div>
            </div>
        </div>
    </div>
</div>`;

dv.paragraph(dashboardHTML);

// 2. Bond-to-Income Analysis with visual representation
dv.header(1, "Bond-to-Income Analysis");

let ratioHTML = `
<div style="border: 1px solid ${colors.borderColor}; border-radius: 8px; padding: 20px; margin-bottom: 30px; background: ${colors.cardBackground};">
    <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
        <div style="text-align: center; flex: 1;">
            <div style="font-size: 0.9em; color: ${colors.textSecondary};">Bond to Gross Income</div>
            <div style="font-size: 1.8em; font-weight: bold; margin: 10px 0; color: ${colors.textPrimary};">${formatPercentage(bondToGrossIncomeRatio)}</div>
            <div style="width: 80%; height: 10px; background: #404040; margin: 0 auto; border-radius: 5px; overflow: hidden;">
                <div style="width: ${Math.min(bondToGrossIncomeRatio, 100)}%; height: 100%; background: ${bondToGrossIncomeRatio > 30 ? colors.dangerRed : colors.propertyColor}; border-radius: 5px;"></div>
            </div>
            <div style="font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 5px;">
                ${bondToGrossIncomeRatio > 30 ? '⚠️ Above recommended 30%' : '✓ Within recommended range'}
            </div>
        </div>
        
        <div style="text-align: center; flex: 1;">
            <div style="font-size: 0.9em; color: ${colors.textSecondary};">Bond to Net Income</div>
            <div style="font-size: 1.8em; font-weight: bold; margin: 10px 0; color: ${colors.textPrimary};">${formatPercentage(bondToNetIncomeRatio)}</div>
            <div style="width: 80%; height: 10px; background: #404040; margin: 0 auto; border-radius: 5px; overflow: hidden;">
                <div style="width: ${Math.min(bondToNetIncomeRatio, 100)}%; height: 100%; background: ${bondToNetIncomeRatio > 40 ? colors.dangerRed : colors.propertyColor}; border-radius: 5px;"></div>
            </div>
            <div style="font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 5px;">
                ${bondToNetIncomeRatio > 40 ? '⚠️ Above recommended 40%' : '✓ Within recommended range'}
            </div>
        </div>
    </div>
    
    <div style="display: flex; justify-content: space-around;">
        <div style="text-align: center; flex: 1;">
            <div style="font-size: 0.9em; color: ${colors.textSecondary};">Rental to Gross Income</div>
            <div style="font-size: 1.8em; font-weight: bold; margin: 10px 0; color: ${colors.textPrimary};">${formatPercentage(rentalToGrossIncomeRatio)}</div>
            <div style="width: 80%; height: 10px; background: #404040; margin: 0 auto; border-radius: 5px; overflow: hidden;">
                <div style="width: ${Math.min(rentalToGrossIncomeRatio, 100)}%; height: 100%; background: ${colors.successGreen}; border-radius: 5px;"></div>
            </div>
        </div>
        
        <div style="text-align: center; flex: 1;">
            <div style="font-size: 0.9em; color: ${colors.textSecondary};">Rental to Net Income</div>
            <div style="font-size: 1.8em; font-weight: bold; margin: 10px 0; color: ${colors.textPrimary};">${formatPercentage(rentalToNetIncomeRatio)}</div>
            <div style="width: 80%; height: 10px; background: #404040; margin: 0 auto; border-radius: 5px; overflow: hidden;">
                <div style="width: ${Math.min(rentalToNetIncomeRatio, 100)}%; height: 100%; background: ${colors.successGreen}; border-radius: 5px;"></div>
            </div>
        </div>
    </div>
</div>`;

dv.paragraph(ratioHTML);

// 3. Financial Comparison
dv.header(1, "Financial Comparison");

let comparisonHTML = `
<div style="display: flex; gap: 20px; margin-bottom: 30px;">
    <!-- Without Rental -->
    <div style="flex: 1; border: 1px solid #3a5f90; border-radius: 8px; padding: 20px; background: ${colors.cardBackground};">
        <h3 style="text-align: center; color: #ADD8E6; margin-top: 0;">Without Rental Income</h3>
        
        <div style="margin: 15px 0; color: ${colors.textPrimary};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Monthly Income:</div>
                <div>${formatMoney(totalMonthlyIncome)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Rental Income:</div>
                <div style="color: #74B7AC">+ ${formatMoney(0)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Monthly Tax:</div>
                <div style="color: #B24A3B">- ${formatMoney(monthlyTax)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid ${colors.borderColor};">
                <div>Net Monthly Income:</div>
                <div>${formatMoney(monthlyNetIncome)}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Bond Payment:</div>
                <div>- ${formatMoney(monthlyBondPayment)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Property Expenses:</div>
                <div>- ${formatMoney(propertyExpenses)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Personal Allocation:</div>
                <div>- ${formatMoney(personalAllocation)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.borderColor}; font-weight: bold;">
                <div>Available for Acceleration:</div>
                <div  style="color: #74B7AC">>${formatMoney(withoutRental_Available)}</div>
            </div>
        </div>
        
        <div style="background: ${colors.highlightBackground}; padding: 15px; border-radius: 5px; margin-top: 20px; color: ${colors.textPrimary};">
            <div style="font-weight: bold; text-align: center; margin-bottom: 10px;">Loan Repayment Impact</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>New Loan Term:</div>
                <div>${(withoutRental_NewTerm/12).toFixed(1)} years</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Time Saved:</div>
                <div>${(loanTermYears - withoutRental_NewTerm/12).toFixed(1)} years</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <div>Interest Saved:</div>
                <div>${formatMoney(withoutRental_InterestSaved)}</div>
            </div>
        </div>
    </div>
    
    <!-- With Rental -->
    <div style="flex: 1; border: 1px solid ${colors.rentalColor}; border-radius: 8px; padding: 20px; background: ${colors.cardBackground};">
        <h3 style="text-align: center; color: #90EE90; margin-top: 0;">With Rental Income</h3>
        
        <div style="margin: 15px 0; color: ${colors.textPrimary};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Monthly Income:</div>
                <div>${formatMoney(totalMonthlyIncome)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Rental Income:</div>
                <div style="color: #74B7AC">+ ${formatMoney(rentalIncome)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Monthly Tax:</div>
                <div style="color: #B24A3B">- ${formatMoney(monthlyTax)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid ${colors.borderColor};">
                <div>Net Monthly Income:</div>
                <div>${formatMoney(monthlyNetIncome + rentalIncome)}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Bond Payment:</div>
                <div>- ${formatMoney(monthlyBondPayment)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Property Expenses:</div>
                <div>- ${formatMoney(propertyExpenses)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Personal Allocation:</div>
                <div>- ${formatMoney(personalAllocation)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.borderColor}; font-weight: bold;">
                <div>Available for Acceleration:</div>
                <div style="color: #74B7AC">>${formatMoney(withRental_Available)}</div>
            </div>
        </div>
        
        <div style="background: ${colors.highlightBackground}; padding: 15px; border-radius: 5px; margin-top: 20px; color: ${colors.textPrimary};">
            <div style="font-weight: bold; text-align: center; margin-bottom: 10px;">Loan Repayment Impact</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>New Loan Term:</div>
                <div>${(withRental_NewTerm/12).toFixed(1)} years</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>Time Saved:</div>
                <div>${(loanTermYears - withRental_NewTerm/12).toFixed(1)} years</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <div>Interest Saved:</div>
                <div>${formatMoney(withRental_InterestSaved)}</div>
            </div>
        </div>
    </div>
</div>`;

dv.paragraph(comparisonHTML);

// 4. Loan Payoff Visualization
dv.header(1, "Loan Payoff Visualization");

// Helper function to generate loan curve path
function generateLoanCurve(data, property, maxValue) {
    const width = 100; // Percentage width
    const height = 300;
    let path = '';
    
    for (let i = 0; i < data.length; i++) {
        const x = (i / Math.min(loanTermYears, data.length-1)) * width;
        const y = (data[i][property] / maxValue) * height;
        
        if (i === 0) {
            path = `M ${x},${y}`;
        } else {
            path += ` L ${x},${y}`;
        }
    }
    
    return path;
}

// Generate SVG visualization for loan payoff
let loanVisualizationHTML = `
<div style="border: 1px solid ${colors.borderColor}; border-radius: 8px; padding: 20px; margin-bottom: 30px; background: ${colors.cardBackground};">
    <div style="position: relative; height: 350px; margin-top: 20px; margin-left: 100px; margin-right: 40px;">
        <!-- SVG visualization -->
        <svg width="100%" height="300" style="overflow: visible;">
            <!-- Grid lines -->
            <line x1="0" y1="0" x2="100%" y2="0" stroke="#444" stroke-width="1" />
            <line x1="0" y1="75" x2="100%" y2="75" stroke="#444" stroke-width="1" />
            <line x1="0" y1="150" x2="100%" y2="150" stroke="#444" stroke-width="1" />
            <line x1="0" y1="225" x2="100%" y2="225" stroke="#444" stroke-width="1" />
            <line x1="0" y1="300" x2="100%" y2="300" stroke="#666" stroke-width="1" />
            
            <!-- Standard loan curve -->
            <path d="${generateLoanCurve(yearlyData, 'standard', loanAmount)}" 
                  fill="none" stroke="#999" stroke-width="2" />
                  
            <!-- With rental curve -->
            <path d="${generateLoanCurve(yearlyData, 'withRental', loanAmount)}" 
                  fill="none" stroke="#4caf50" stroke-width="3" />
                  
            <!-- Without rental curve -->
            <path d="${generateLoanCurve(yearlyData, 'withoutRental', loanAmount)}" 
                  fill="none" stroke="#3a5f90" stroke-width="3" />
        </svg>
        
        <!-- Y-axis labels -->
        <div style="position: absolute; left: -100px; top: 0; height: 300px; display: flex; flex-direction: column; justify-content: space-between; color: ${colors.textPrimary};">
            <div style="text-align: right;">R0</div>
            <div style="text-align: right;">${formatMoney(loanAmount * 0.25)}</div>
            <div style="text-align: right;">${formatMoney(loanAmount * 0.5)}</div>
            <div style="text-align: right;">${formatMoney(loanAmount * 0.75)}</div>
            <div style="text-align: right;">${formatMoney(loanAmount)}</div>
        </div>
        
        <!-- X-axis labels -->
        <div style="position: absolute; bottom: -30px; left: 0; width: 100%; display: flex; justify-content: space-between; color: ${colors.textPrimary};">
            <div>Year 0</div>
            <div>Year 5</div>
            <div>Year 10</div>
            <div>Year 15</div>
            <div>Year 20</div>
        </div>
    </div>
    
    <!-- Legend -->
    <div style="display: flex; justify-content: center; gap: 30px; margin-top: 40px; color: ${colors.textPrimary};">
        <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 3px; background: #999; margin-right: 10px;"></div>
            <div>Standard Loan (${loanTermYears} years)</div>
        </div>
        
        <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 3px; background: #3a5f90; margin-right: 10px;"></div>
            <div>Without Rental (${(withoutRental_NewTerm/12).toFixed(1)} years)</div>
        </div>
        
        <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 3px; background: #4caf50; margin-right: 10px;"></div>
            <div>With Rental (${(withRental_NewTerm/12).toFixed(1)} years)</div>
        </div>
    </div>
</div>`;

dv.paragraph(loanVisualizationHTML);
```