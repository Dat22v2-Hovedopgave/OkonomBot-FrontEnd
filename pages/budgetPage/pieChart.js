import { fetchedEarnings } from "./earnings.js";
import { fetchedExpenses } from "./expenses.js";
import { totalEarnings, totalExpenses } from "./budgetPage.js";

export function initPieChart(){
    console.log('Hello from pieChart factory!');
    console.log('fetchedEarnings: ', fetchedEarnings);
    console.log('fetchedExpenses: ', fetchedExpenses);
    renderPieCharts(fetchedEarnings, fetchedExpenses);
}

export function renderPieCharts(earnings,expenses){

    if(totalEarnings == 0 || totalExpenses == 0){
        document.getElementById('diagramError').innerHTML = 'Venligst udfyld flere detaljer om budget for at kunne generere diagrammer.';
    } else {
        document.getElementById('diagramError').innerHTML = '';

        renderExpensesAndIncomePie(earnings,expenses);
        renderExpensesCategoryPie(expenses);
    }

}

function renderExpensesAndIncomePie(earnings,expenses){

    if (!earnings || !expenses) {
        console.error('Earnings or expenses data is missing');
        return;
    }

    let totalMoney = totalEarnings + totalExpenses;

    let expensePercentage = (totalExpenses / totalMoney) * 100;

    let incomePercentage = (totalEarnings / totalMoney) * 100;

    const dataPoints = [
        { label: "Udgifter", y: expensePercentage, color: "red" },
        { label: "Overskud", y: incomePercentage, color: "green" }
    ];

    const chart = new CanvasJS.Chart("expensesAndRestPie", {
        animationEnabled: true,
        title: {
            text: "Udgifter og indtægter"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "",
            dataPoints: dataPoints
        }]
    });

    chart.render();
}

function renderExpensesCategoryPie(expenses) {
    const categoryTotals = {};

    expenses.forEach(expense => {
        if (!categoryTotals[expense.categoryName]) {
            categoryTotals[expense.categoryName] = 0;
        }
        categoryTotals[expense.categoryName] += expense.amount;
    });

    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);

    const dataPoints = Object.keys(categoryTotals).map(categoryName => ({
        y: (categoryTotals[categoryName] / totalAmount) * 100,
        label: categoryName
    }));
    
    const chart = new CanvasJS.Chart("entireExpensesPie", {
        animationEnabled: true,
        title: {
            text: "Udgifter pr. kategori"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "",
            dataPoints: dataPoints
        }]
    });

    chart.render();
}
