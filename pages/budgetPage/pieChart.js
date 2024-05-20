import { fetchedEarnings } from "./earnings.js";
import { fetchedExpenses } from "./expenses.js";

export function initPieChart(){
    console.log('Hello from pieChart factory!');
    console.log('fetchedEarnings: ', fetchedEarnings);
    console.log('fetchedExpenses: ', fetchedExpenses);
    renderPieCharts(fetchedEarnings, fetchedExpenses);
}

export function renderPieCharts(earnings,expenses){

    renderExpensesAndRestPie(earnings,expenses);

    renderEntireExpensesPie(expenses);

}

function renderExpensesAndRestPie(earnings,expenses){

    if (!earnings || !expenses) {
        console.error('Earnings or expenses data is missing');
        return;
    }

    const totalEarnings = earnings.reduce((acc, earning) => acc + earning.amount, 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);

    let expensePercentage, incomePercentage;

    if (totalExpenses > totalEarnings) {
        expensePercentage = (totalExpenses / totalEarnings) * 100;
        incomePercentage = 0;
    } else {
        expensePercentage = (totalExpenses / totalEarnings) * 100;
        incomePercentage = 100 - expensePercentage;
    }

    const dataPoints = [
        { label: "Udgifter", y: expensePercentage, color: "red" },
        { label: "Overskud", y: incomePercentage, color: "green" }
    ];

    const chart = new CanvasJS.Chart("expensesAndRestPie", {
        animationEnabled: true,
        title: {
            text: "Udgifter ift. al indkomst"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: dataPoints
        }]
    });

    chart.render();
}

function renderEntireExpensesPie(expenses){

    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);

    const dataPoints = expenses.map(expense => ({
        y: (expense.amount / totalAmount) * 100, // percentage
        label: `${expense.subcategoryName} (${expense.categoryName})`
    }));

    var chart = new CanvasJS.Chart("entireExpensesPie", {
        animationEnabled: true,
        title: {
            text: "Expense Breakdown"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: dataPoints
        }]
    });

    chart.render();
}