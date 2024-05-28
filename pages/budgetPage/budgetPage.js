import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

import { initEarnings, saveAllEarnings } from "./earnings.js";
import { initExpenses, saveAllExpenses } from "./expenses.js";
import { initPieChart } from "./pieChart.js";
import { initAdvice } from "./aiAdvice.js";

export let totalEarnings = 0;
export let totalExpenses = 0;

export async function initBudget() {
    console.log('==>> budgetpage.js Hello from here');

    await fetchAllInfo();

    fetchEarnings(username); //???
    fetchExpenses(username); //???

    document.getElementById('save-all-button').addEventListener('click', calculator);

    initAdvice();
}

async function calculator(){
    await saveAll()
    await fetchEarnings(username)
    await fetchExpenses(username)
    initPieChart()
}

async function fetchAllInfo(){
    await Promise.all([
        initEarnings(),
        initExpenses()
    ]);
}


const username = getUserFromLocalStorage();

function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

async function fetchEarnings(username) {
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

// Function to calculate total earnings
function calculateTotalEarnings(earnings) {
    let total = 0;
    earnings.forEach(earning => {
        total += earning.amount;
    });
    return total;
}

// Function to render earnings
function renderEarnings(earnings) {
    totalEarnings = calculateTotalEarnings(earnings);

    // Update the total earnings display
    document.getElementById('total-earnings').innerText = `${totalEarnings.toFixed(2)} kr.`;

    // Update the total budget outcome
    updateTotalBudget();
}

async function fetchExpenses(username) {
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/expenses/user/' + username, options);
        const result = await handleHttpErrors(response);
        renderExpenses(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// Function to calculate total expenses
function calculateTotalExpenses(expenses) {
    let total = 0;
    expenses.forEach(expense => {
        total += expense.amount;
    });
    return total;
}

// Function to render expenses
function renderExpenses(expenses) {
    totalExpenses = calculateTotalExpenses(expenses);

    // Update the total expenses display
    document.getElementById('total-expenses').innerText = `${totalExpenses.toFixed(2)} kr.`;

    // Update the total budget outcome
    updateTotalBudget();
}

// Function to update the total budget outcome
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

// Function to save all earnings and expenses
export async function saveAll() {
    try {
        await saveAllEarnings();
        await saveAllExpenses();
        showToast();
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Function to show the toast notification
function showToast() {
    const toastElement = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

