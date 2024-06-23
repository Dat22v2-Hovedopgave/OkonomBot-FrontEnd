import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

import { initEarnings, saveAllEarnings } from "./earnings.js";
import { initExpenses, saveAllExpenses } from "./expenses.js";
import { initPieChart } from "./pieChart.js";
import { initAdvice } from "./aiAdvice.js";

export let totalEarnings = 0;
export let totalExpenses = 0;

// Initialiserer budget
export async function initBudget() {
    console.log('==>> budgetpage.js Hello from here');

    await fetchAllInfo();

    fetchEarnings(); // Henter indtægter fra API
    fetchExpenses(); // Henter udgifter fra API

    document.getElementById('save-all-button').addEventListener('click', calculator);

    initAdvice();
}

// Funktion til at beregne og opdatere data
async function calculator() {
    await saveAll();
    await fetchEarnings();
    await fetchExpenses();
    initPieChart();
}

// Funktion til at hente alle oplysninger
async function fetchAllInfo() {
    await Promise.all([
        initEarnings(),
        initExpenses()
    ]);
}

// Henter brugernavn fra local storage
function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

// Henter indtægter fra API
async function fetchEarnings() {
    let username = getUserFromLocalStorage();
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/earnings/user/' + username, options);
        const result = await handleHttpErrors(response);
        console.log('Earnings:', result);
        renderEarnings(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// Henter udgifter fra API
async function fetchExpenses() {
    let username = getUserFromLocalStorage();
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/expenses/user/' + username, options);
        const result = await handleHttpErrors(response);
        renderExpenses(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// Funktion til at beregne samlede udgifter
function calculateTotalExpenses(expenses) {
    let total = 0;
    expenses.forEach(expense => {
        total += expense.amount;
    });
    return total;
}
// Funktion til at beregne samlede indtægter
function calculateTotalEarnings(earnings) {
    let total = 0;
    earnings.forEach(earning => {
        total += earning.amount;
    });
    return total;
}

// Funktion til at vise indtægter
function renderEarnings(earnings) {
    totalEarnings = calculateTotalEarnings(earnings);

    // Opdaterer visningen af samlede indtægter
    document.getElementById('total-earnings').innerText = `${totalEarnings.toFixed(2)} kr.`; //Konverterer totalEarnings til en streng med to decimaler.

    // Opdaterer det samlede budget
    updateTotalBudget();
}

// Funktion til at vise udgifter
function renderExpenses(expenses) {
    totalExpenses = calculateTotalExpenses(expenses);

    // Opdaterer visningen af samlede udgifter
    document.getElementById('total-expenses').innerText = `${totalExpenses.toFixed(2)} kr.`; //Konverterer totalExpenses til en streng med to decimaler.

    // Opdaterer det samlede budget
    updateTotalBudget();
}

// Funktion til at opdatere det samlede budget
function updateTotalBudget() {
    const outcomeTotalElement = document.getElementById('total-budget');

    const totalBudget = totalEarnings - totalExpenses;

    console.log('Total Budget:', totalBudget);
    outcomeTotalElement.innerHTML = totalBudget + " kr.";

    const totalBudgetCard = document.getElementById('card-total-budget');

    if (totalBudget < 0) {
        totalBudgetCard.classList.add('bg-danger');
        totalBudgetCard.classList.remove('bg-success');
    } else {
        totalBudgetCard.classList.add('bg-success');
        totalBudgetCard.classList.remove('bg-danger');
    }
}

// Funktion til at gemme alle indtægter og udgifter
export async function saveAll() {
    try {
        await saveAllEarnings();
        await saveAllExpenses();
        showToast();
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Funktion til at vise en toast-notifikation
function showToast() {
    const toastElement = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Funktion til at rense DOM input
export function purifyDOM(htmlInput) {
    let result = DOMPurify.sanitize(htmlInput, {
        ALLOWED_TAGS: [], // Ingen tags tilladt
        ALLOWED_ATTR: []  // Ingen attributter tilladt
    });
    
    return result;
}
