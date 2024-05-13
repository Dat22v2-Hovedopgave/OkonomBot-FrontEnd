import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

export function initEarnings() {
    fetchEarnings(username);
    fetchCategories();

}

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
    let categories = {};

    // Group earnings by category
    earningsData.forEach(earning => {
        if (!categories[earning.categoryName]) {
            categories[earning.categoryName] = [];
        }
        categories[earning.categoryName].push(earning);
    });

    let htmlContent = '';

    htmlContent += `<div class="input-group">
    <select class="form-select" id="earningCategorySelect" aria-label="Example select with button addon">
      <option value="" selected>Choose...</option>`;
    earningsCategories.forEach(cat => {
        htmlContent += `<option value="${cat.categoryId}">${cat.name}</option>`;
    });
    htmlContent += `</select>
    <button class="btn btn-outline-secondary" type="button" id="create-earning-category-button">Create Category</button>
    </div>`;

    // Build HTML content for each category
    for (let categoryName in categories) {
        htmlContent += '<h3 class="pt-3">' + categoryName + '</h3>'; // Category name header
        categories[categoryName].forEach(earning => {
            htmlContent += '<h6>' + earning.subcategoryName + " Subcategory ID: " + earning.subcategoryId + '</h6>'; // Subcategory name
            htmlContent += '<div class="input-group mb-3">';
            htmlContent += '<input type="text" class="form-control" value="' + earning.amount + '" id="subcatEarning-' + earning.subcategoryId + '" data-category-id="' + earning.categoryId + '">';
            htmlContent += '<button class="btn btn-outline-secondary btn-outline-danger" type="button" id="deleteEarning-' + earning.earningId + '")">Delete</button>';
            htmlContent += '</div>';
            totalEarnings += earning.amount;
        });

        htmlContent += `<div class="input-group input-group-sm mb-3">
        <input type="text" class="form-control" placeholder="type..." aria-describedby="add-subcategoryEarning" data-category-id="${categories[categoryName][0].categoryId}">
        <button class="btn btn-outline-secondary add-subcategoryEarning" type="button">Add subcategory</button>
        </div>`;
    }
    // Tilføj en knap til at gemme alle earnings
    htmlContent += `<hr><br><button id="save-all-button" class="btn btn-primary">Save Earnings</button>`;

    earningsContainer.innerHTML = htmlContent;
    attachEventListeners();
    updateIncomeTotal();
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

async function saveAllEarnings() {
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
        fetchEarnings(username);
    } catch (error) {
        console.error('There was a problem adding the subcategory:', error);
    }
    console.log('Adding subcategory:', subcategory.name, 'to category ID:', subcategory.categoryId);
}

async function deleteEarning(earningId) {
    console.log('Deleting earning with earnings ID:', earningId);
    const options = makeOptions("DELETE", '', false);
    try {
        const response = await fetch(URL + '/earnings/' + earningId, options);
        const result = await handleHttpErrors(response);
        console.log('Earning deleted successfully:', result);
        await fetchEarnings(username);
    } catch (error) {
        console.error('There was a problem deleting the earning:', error);
    }
}

function attachEventListeners() {
    const saveButton = document.getElementById('save-all-button');
    saveButton.addEventListener('click', saveAllEarnings);

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

function updateIncomeTotal() {
    const incomeTotal = document.getElementById('income-total');
    incomeTotal.value = totalEarnings;
    totalEarnings = 0;
}