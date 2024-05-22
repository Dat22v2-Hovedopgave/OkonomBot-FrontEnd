import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";
import { saveAll } from "./budgetPage.js";

export function initEarnings() {
    fetchEarnings(username);
    fetchCategories();
}

let deletedEarningIds = [];
var totalEarnings = 0;
let earningsCategories = [];
const username = getUserFromLocalStorage();

function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

async function fetchCategories() {
    const options = makeOptions("GET", '', false);

    try {
        const response = await fetch(URL + '/categories/', options);
        const categories = await handleHttpErrors(response);
        earningsCategories = categories.filter(category => category.type === 'earning');

        console.log('Earnings Categories:', earningsCategories);

    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

function renderEarnings(earningsData) {
    const earningsContainer = document.getElementById('earnings-category');
    const earningsTotalsContainer = document.getElementById('earnings-category-totals');
    let categories = {};
    let categoryTotals = {};

    // Group earnings by category
    earningsData.forEach(earning => {
        if (!categories[earning.categoryName]) {
            categories[earning.categoryName] = [];
            categoryTotals[earning.categoryName] = 0;
        }
        categories[earning.categoryName].push(earning);
        categoryTotals[earning.categoryName] += earning.amount;
    });

    let htmlContent = '';

    htmlContent += `<div class="input-group mb-3" style="max-width: 30rem;">
    <select class="form-select" id="earningCategorySelect" aria-label="Example select with button addon">
      <option value="" selected>Vælg...</option>`;
    earningsCategories.forEach(cat => {
        htmlContent += `<option value="${cat.categoryId}">${cat.name}</option>`;
    });
    htmlContent += `</select>
    <button class="btn btn-outline-secondary" type="button" id="create-earning-category-button">Tilføj Kategori</button>
    </div>`;

    // Build HTML content for each category inside a card
    for (let categoryName in categories) {
        htmlContent += `
        <div class="card text-bg-light mb-3" style="max-width: 30rem;">
          <div class="card-header">${categoryName}</div>
          <div class="card-body">`;

        categories[categoryName].forEach(earning => {
            htmlContent += `
            <h6>${earning.subcategoryName}</h6>
            <div class="input-group mb-3">
              <span class="input-group-text">kr.</span>
              <input type="number" class="form-control" value="${earning.amount}" id="subcatEarning-${earning.subcategoryId}" data-category-id="${earning.categoryId}">
              <button class="btn btn-outline-secondary btn-outline-danger" type="button" id="deleteEarning-${earning.earningId}">Slet</button>
            </div>`;
        });

        htmlContent += `
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="indtægt kategori..." aria-describedby="add-subcategoryEarning" data-category-id="${categories[categoryName][0].categoryId}">
              <button class="btn btn-outline-secondary add-subcategoryEarning" type="button">Tilføj underkategori</button>
            </div>
          </div>
        </div>`;
    }

    earningsContainer.innerHTML = htmlContent;

    // Render category totals inside the card
    let totalsHtmlContent = '<h5>Indtægter pr. kategori</h5><hr class="border border-success border-3 opacity-75">';
    for (let categoryName in categoryTotals) {
        totalsHtmlContent += `<p>${categoryName}: ${categoryTotals[categoryName].toFixed(2)} kr.</p>`;
    }
    earningsTotalsContainer.innerHTML = totalsHtmlContent;

    attachEventListeners();
}


async function fetchEarnings(username) {
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/earnings/user/' + username, options);
        const result = await handleHttpErrors(response);
        renderEarnings(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

export async function saveAllEarnings() {
    const earningsInputs = document.querySelectorAll('[id^="subcatEarning-"]');
    const earnings = Array.from(earningsInputs).map(input => ({
        username: username,
        subcategoryId: input.id.split('-')[1],
        amount: parseFloat(input.value)
    }));

    console.log('Saving all earnings by subcategory:', earnings);
    const options = makeOptions("POST", earnings, true);

    try {
        const response = await fetch(URL + '/earnings/addEarnings', options);
        const result = await handleHttpErrors(response);
        console.log('Earnings saved successfully:', result);
        fetchEarnings(username);
    } catch (error) {
        console.error('There was a problem saving earnings:', error);
    }
}

function addCategory() {
    const categorySelect = document.getElementById('earningCategorySelect');
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

async function deleteEarning(earningId) {
    await saveAll();
    console.log('Deleting earning with earnings ID:', earningId);
    const options = makeOptions("DELETE", '', false);
    try {
        const response = await fetch(URL + '/earnings/' + earningId, options);
        const result = await handleHttpErrors(response);
        console.log('Earning deleted successfully:', result);
    } catch (error) {
        console.error('There was a problem deleting the earning:', error);
    }
    fetchEarnings(username);

}

function attachEventListeners() {
    const addCategoryButton = document.getElementById('create-earning-category-button');
    addCategoryButton.addEventListener('click', addCategory);

    const addSubcategoryButtons = document.querySelectorAll('.add-subcategoryEarning');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            addSubcategory(this);
        });
    });

    const deleteButtons = document.querySelectorAll('[id^="deleteEarning-"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            deleteEarning(this.id.split('-')[1]);
        });
    });
}

