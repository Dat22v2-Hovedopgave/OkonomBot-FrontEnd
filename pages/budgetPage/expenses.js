import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

export function initExpenses() {

    fetchCategories();
    fetchExpenses(username);

}

var totalExpenses = 0;
let expenseCategories = [];
const username = getUserFromLocalStorage();

function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

function renderExpenses(expensesData) {
    const expensesContainer = document.getElementById('expenses-category');
    let categories = {};

    // Group expenses by category
    expensesData.forEach(expense => {
        if (!categories[expense.categoryName]) {
            categories[expense.categoryName] = [];
        }
        categories[expense.categoryName].push(expense);
    });

    let htmlContent = '';

    htmlContent += `<div class="input-group">
    <select class="form-select" id="expenseCategorySelect" aria-label="Example select with button addon">
      <option value="" selected>Choose...</option>`;
    expenseCategories.forEach(cat => {
        htmlContent += `<option value="${cat.categoryId}">${cat.name}</option>`;
    });
    htmlContent += `</select>
    <button class="btn btn-outline-secondary" type="button" id="create-expense-category-button">Create Category</button>
    </div>`;

    // Build HTML content for each category
    for (let categoryName in categories) {
        htmlContent += '<h3 class="pt-3">' + categoryName + '</h3>'; // Category name header
        categories[categoryName].forEach(expense => {
            htmlContent += '<h6>' + expense.subcategoryName + " Subcategory ID: " + expense.subcategoryId + '</h6>'; // Subcategory name header
            htmlContent += '<div class="input-group mb-3">';
            // Add input field for expense amount
            htmlContent += '<input type="text" class="form-control" value="' + expense.amount + '" id="subcatexpense-' + expense.subcategoryId + '" data-category-id="' + expense.categoryId + '">';
            // Add delete button
            htmlContent += '<button class="btn btn-outline-secondary delete-button btn-outline-danger" type="button" id="delete-' + expense.expenseId + '">Delete</button>';
            htmlContent += '</div>';
            totalExpenses += expense.amount;
        });

        htmlContent += `<div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="type..." aria-describedby="add-subcategoryExpense" data-category-id="${categories[categoryName][0].categoryId}">
        <button class="btn btn-outline-secondary add-subcategoryExpense" type="button">Add subcategory</button>
        </div>`;
    }
    // Tilføj en knap til at gemme alle expenses
    htmlContent += `<hr><br><button id="save-expenses" class="btn btn-primary">Save Expenses</button>`;

    expensesContainer.innerHTML = htmlContent;
    attachEventListeners();
    updateOutcomeTotal();
}

function attachEventListeners() {
    const saveButton = document.getElementById('save-expenses');
    saveButton.addEventListener('click', saveAllExpenses);

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
        renderExpenses(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

async function saveAllExpenses() {
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
    console.log('Deleting expense with expenses ID:', expensesId);
    const options = makeOptions("DELETE", '', false);
    try {
        const response = await fetch(URL + '/expenses/' + expensesId, options);
        const result = await handleHttpErrors(response);
        console.log('Expense deleted successfully:', result);
        await fetchExpenses(username);
    } catch (error) {
        console.error('There was a problem deleting the expense:', error);
    }
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
        name: 'New Subcategory',
        username: username
    };

    postSubcategory(subcategory);
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
}

async function postSubcategory(subcategory) {
    const options = makeOptions("POST", subcategory, false);
    try {
        const response = await fetch(URL + '/subcategories/addSubcategory', options);
        const result = await handleHttpErrors(response);
        console.log('Subcategory added successfully:', result);
        fetchExpenses(username);
    } catch (error) {
        console.error('There was a problem adding the subcategory:', error);
    }
    console.log('Adding subcategory:', subcategory.name, 'to category ID:', subcategory.categoryId);
}

function updateOutcomeTotal() {
    const outcomeTotal = document.getElementById('outcome-total');
    outcomeTotal.value = totalExpenses;
    totalExpenses = 0;
}