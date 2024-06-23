import { fetchedEarnings } from "./earnings.js";
import { fetchedExpenses } from "./expenses.js";
import { totalEarnings, totalExpenses } from "./budgetPage.js";

export function initPieChart() {
    console.log('Hello from pieChart factory!');
    console.log('fetchedEarnings: ', fetchedEarnings);
    console.log('fetchedExpenses: ', fetchedExpenses);
    renderPieCharts(fetchedEarnings, fetchedExpenses); // Render pie charts med hentede data
}

export function renderPieCharts(earnings, expenses) {
    if (totalEarnings == 0 || totalExpenses == 0) {
        document.getElementById('diagramError').innerHTML = 'Venligst udfyld flere detaljer om budget for at kunne generere diagrammer.'; // Vis fejlbesked hvis der ikke er data
    } else {
        document.getElementById('diagramError').innerHTML = '';
        renderExpensesAndIncomePie(earnings, expenses); // Render pie chart for indtægter og udgifter
        renderExpensesCategoryPie(expenses); // Render pie chart for udgiftskategorier
    }
}

function renderExpensesAndIncomePie(earnings, expenses) {
    if (!earnings || !expenses) {
        console.error('Earnings or expenses data is missing'); // Log fejl hvis data mangler
        return;
    }

    let totalMoney = totalEarnings + totalExpenses; // Beregn total penge
    let expensePercentage = (totalExpenses / totalMoney) * 100; // Beregn udgift procentdel
    let incomePercentage = (totalEarnings / totalMoney) * 100; // Beregn indtægt procentdel

    const dataPoints = [
        { label: "Udgifter", y: expensePercentage, color: "red" }, // Datapunkt for udgifter
        { label: "Indtægter", y: incomePercentage, color: "green" } // Datapunkt for indtægter
    ];

    const chart = new CanvasJS.Chart("expensesAndRestPie", {
        animationEnabled: true, // Animeret diagram
        title: { text: "Udgifter og indtægter" }, // Diagram titel
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "",
            dataPoints: dataPoints // Datapunkter for diagrammet
        }]
    });

    chart.render(); // Render diagrammet
}

function renderExpensesCategoryPie(expenses) {
    const categoryTotals = {};

    expenses.forEach(expense => {
        // Summer udgifter pr. kategori
        if (!categoryTotals[expense.categoryName]) {
            categoryTotals[expense.categoryName] = 0;
        }
        categoryTotals[expense.categoryName] += expense.amount;
    });

    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0); // Beregn total udgifter

    const dataPoints = Object.keys(categoryTotals).map(categoryName => ({
        y: (categoryTotals[categoryName] / totalAmount) * 100, // Beregn procentdel for hver kategori
        label: categoryName // Kategorinavn som label
    }));
    
    const chart = new CanvasJS.Chart("entireExpensesPie", {
        animationEnabled: true, // Animeret diagram
        title: { text: "Udgifter pr. kategori" }, // Diagram titel
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "",
            dataPoints: dataPoints // Datapunkter for diagrammet
        }]
    });

    chart.render(); // Render diagrammet
}
