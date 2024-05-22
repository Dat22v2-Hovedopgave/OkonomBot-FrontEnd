import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";
import { saveAll } from "./budgetPage.js";

import { renderPieCharts } from "./pieChart.js";

export let fetchedExpenses;

var totalExpenses = 0;
let expenseCategories = [];
const username = getUserFromLocalStorage();

export async function initExpenses() {
    await fetchCategories();
    await fetchExpenses(username);
}

function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

function renderExpenses(expensesData) {
    const expensesContainer = document.getElementById('expenses-category');
    const expensesTotalsContainer = document.getElementById('expenses-category-totals');
    let categories = {};
    let categoryTotals = {};

    // Group expenses by category
    expensesData.forEach(expense => {
        if (!categories[expense.categoryName]) {
            categories[expense.categoryName] = [];
            categoryTotals[expense.categoryName] = 0;
        }
        categories[expense.categoryName].push(expense);
        categoryTotals[expense.categoryName] += expense.amount;
    });

    let htmlContent = '';

    htmlContent += `<div class="input-group mb-3" style="max-width: 30rem;">
    <select class="form-select" id="expenseCategorySelect" aria-label="Example select with button addon">
      <option value="" selected>Vælg...</option>`;
    expenseCategories.forEach(cat => {
        htmlContent += `<option value="${cat.categoryId}">${cat.name}</option>`;
    });
    htmlContent += `</select>
    <button class="btn btn-outline-secondary" type="button" id="create-expense-category-button">Tilføj kategori</button>
    </div>`;

    // Build HTML content for each category inside a card
    for (let categoryName in categories) {
        htmlContent += `
        <div class="card text-bg-light mb-3" style="max-width: 30rem;">
          <div class="card-header">${categoryName}</div>
          <div class="card-body">`;

        categories[categoryName].forEach(expense => {
            htmlContent += `
            <h6>${expense.subcategoryName}</h6>
            <div class="input-group mb-3">
              <span class="input-group-text">kr.</span>
              <input type="number" class="form-control" value="${expense.amount}" id="subcatexpense-${expense.subcategoryId}" data-category-id="${expense.categoryId}">
              <button class="btn btn-outline-secondary delete-button btn-outline-danger" type="button" id="delete-${expense.expenseId}">Slet</button>
            </div>`;
        });

        htmlContent += `
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Udgifts kategori..." aria-describedby="add-subcategoryExpense" data-category-id="${categories[categoryName][0].categoryId}">
              <button class="btn btn-outline-secondary add-subcategoryExpense" type="button">Tilføj underkategori</button>
            </div>
          </div>
        </div>`;
    }

    expensesContainer.innerHTML = htmlContent;

    // Render category totals inside the card
    let totalsHtmlContent = '<h5>Udgifter pr. kategori</h5><hr class="border border-danger border-3 opacity-75">';
    for (let categoryName in categoryTotals) {
        totalsHtmlContent += `<p>${categoryName}: ${categoryTotals[categoryName].toFixed(2)} kr.</p>`;
    }
    expensesTotalsContainer.innerHTML = totalsHtmlContent;

    attachEventListeners();
}


function attachEventListeners() {
    const addCategoryButton = document.getElementById('create-expense-category-button');
    addCategoryButton.addEventListener('click', addCategory);

    const addSubcategoryButtons = document.querySelectorAll('.add-subcategoryExpense');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            addSubcategory(this);
        });
    });

    const deleteButtons = document.querySelectorAll('[id^="delete-"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            deleteExpenses(this.id.split('-')[1]);
        });
    });
}

async function fetchCategories() {
    const options = makeOptions("GET", '', false);

    try {
        const response = await fetch(URL + '/categories/', options);
        const categories = await handleHttpErrors(response);
        expenseCategories = categories.filter(category => category.type === 'expense');
        fetchExpenses(username);

        console.log('Expense Categories:', expenseCategories);

    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

async function fetchExpenses(username) {
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/expenses/user/' + username, options);
        const result = await handleHttpErrors(response);
        
        fetchedExpenses = JSON.parse(JSON.stringify(result));
        console.log('Resulting response from fetchExpenses: ',result);
        renderExpenses(result);
        renderPieCharts();
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

export async function saveAllExpenses() {
    const expensesInput = document.querySelectorAll('[id^="subcatexpense-"]');
    const expenses = Array.from(expensesInput).map(input => ({
        username: username,
        subcategoryId: input.id.split('-')[1],
        amount: parseFloat(input.value)
    }));

    console.log('Saving all expenses by subcategory:', expenses);
    const options = makeOptions("POST", expenses, true);

    try {
        const response = await fetch(URL + '/expenses/addExpenses', options);
        const result = await handleHttpErrors(response);
        console.log('Expenses saved successfully:', result);
        fetchExpenses(username);
    } catch (error) {
        console.error('There was a problem saving expenses:', error);
    }
}

async function deleteExpenses(expensesId) {
    await saveAll();
    console.log('Deleting expense with expenses ID:', expensesId);
    const options = makeOptions("DELETE", '', false);
    try {
        const response = await fetch(URL + '/expenses/' + expensesId, options);
        const result = await handleHttpErrors(response);
        console.log('Expense deleted successfully:', result);
    } catch (error) {
        console.error('There was a problem deleting the expense:', error);
    }
    fetchExpenses(username);

}

function addCategory() {
    const categorySelect = document.getElementById('expenseCategorySelect');
    const categoryId = categorySelect.value;

    if (!categoryId) {
        console.error('No category selected.');
        return;
    }

    const subcategory = {
        categoryId: categoryId,
        name: 'Diverse',
        username: username
    };

    postSubcategory(subcategory);
    saveAll();
    console.log(`Attempting to add a default subcategory to category ID: ${categoryId}`);
}

function addSubcategory(button) {
    const subcategoryInput = button.previousElementSibling;
    const categoryId = subcategoryInput.dataset.categoryId;
    const subcategoryName = subcategoryInput.value.trim();

    if (!categoryId || !subcategoryName) {
        console.error('Category ID or subcategory name is missing.');
        return;
    }

    const subcategory = {
        categoryId: categoryId,
        name: subcategoryName,
        username: username
    };
    postSubcategory(subcategory);
    saveAll();
}

async function postSubcategory(subcategory) {
    const options = makeOptions("POST", subcategory, false);
    try {
        const response = await fetch(URL + '/subcategories/addSubcategory', options);
        const result = await handleHttpErrors(response);
        console.log('Subcategory added successfully:', result);
    } catch (error) {
        console.error('There was a problem adding the subcategory:', error);
    }
    console.log('Adding subcategory:', subcategory.name, 'to category ID:', subcategory.categoryId);
}

