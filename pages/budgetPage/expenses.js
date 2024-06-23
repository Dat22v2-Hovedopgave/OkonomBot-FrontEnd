import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";
import { saveAll } from "./budgetPage.js";
import { purifyDOM } from "./budgetPage.js";

export let fetchedExpenses;

var totalExpenses = 0;
let expenseCategories = [];
//const username = getUserFromLocalStorage();

// Initialiserer udgifter
export async function initExpenses() {
    await fetchCategories();
    await fetchExpenses();
}

// Henter brugernavn fra local storage
function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

// Renderer udgifter på siden
function renderExpenses(expensesData) {
    const expensesContainer = document.getElementById('expenses-category');
    const expensesTotalsContainer = document.getElementById('expenses-category-totals');
    let categories = {};
    let categoryTotals = {};

    // Grupperer udgifter efter kategori
    expensesData.forEach(expense => {
        // Hvis kategorien ikke allerede findes i objektet 'categories', så oprettes en ny array for denne kategori
        if (!categories[expense.categoryName]) {
            categories[expense.categoryName] = [];
            // Initialiserer summen for kategorien i objektet 'categoryTotals'
            categoryTotals[expense.categoryName] = 0;
        }
        // Tilføjer udgiften til den relevante kategori
        categories[expense.categoryName].push(expense);
        // Lægger udgiftens beløb til summen for kategorien
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

    // Bygger HTML-indhold for hver kategori inde i et kort
    for (let categoryName in categories) {
        htmlContent += `
        <div class="card text-bg-light mb-3" style="max-width: 30rem;">
          <div class="card-header bg-danger text-light">${categoryName}</div>
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

        // Tilføjer et input-felt for at tilføje en udgift, som en underkategori
        htmlContent += `
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Udgifts kategori..." aria-describedby="add-subcategoryExpense" data-category-id="${categories[categoryName][0].categoryId}">
              <button class="btn btn-outline-secondary add-subcategoryExpense" type="button">Tilføj underkategori</button>
            </div>
          </div>
        </div>`;
    }

    expensesContainer.innerHTML = htmlContent;

    // Viser samlede total for kategorier inde i kortet til højre
    let totalsHtmlContent = '<h5>Udgifter</h5><hr class="border border-danger border-3 opacity-75">';
    for (let categoryName in categoryTotals) {
        totalsHtmlContent += `<p>${categoryName}: ${categoryTotals[categoryName].toFixed(2)} kr.</p>`;
    }
    expensesTotalsContainer.innerHTML = totalsHtmlContent;

    attachEventListeners();
}

// Tilføjer event listeners
function attachEventListeners() {
    // Finder knappen til at tilføje en ny kategori og tilføjer en klik-begivenhedshåndterer
    const addCategoryButton = document.getElementById('create-expense-category-button');
    addCategoryButton.addEventListener('click', addCategory);

    // Finder alle knapper til at tilføje en ny underkategori og tilføjer en event listener til hver
    const addSubcategoryButtons = document.querySelectorAll('.add-subcategoryExpense');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            addSubcategory(this); // this refererer til den aktuelle knap
        });
    });

    // Finder alle knapper til at slette en udgift og tilføjer en event listener til hver
    const deleteButtons = document.querySelectorAll('[id^="delete-"]'); // Finder alle knapper, der har et id, der starter med "deleteEarning-"
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            deleteExpenses(this.id.split('-')[1]); // this refererer til den aktuelle knap, og split deler id'et for at få expensesId
        });                                       // id="delete-1" bliver til ["delete", "1"]
    });
}

// Henter kategorier fra API
async function fetchCategories() {
    const options = makeOptions("GET", '', false);

    try {
        const response = await fetch(URL + '/categories/', options);
        const categories = await handleHttpErrors(response);
        expenseCategories = categories.filter(category => category.type === 'expense'); // Filtrerer kun de kategorier, der er udgifter
        console.log('Expense Categories:', expenseCategories);

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
        
        fetchedExpenses = JSON.parse(JSON.stringify(result)); // Den eneste måde at lave en kopi af objektet i stedet for at henvise til det.
        console.log('Resulting response from fetchExpenses: ', result);
        renderExpenses(result);
    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// Gemmer alle udgifter
export async function saveAllExpenses() {
    let username = getUserFromLocalStorage();
    // Finder alle input-felter, der har et "id", der starter med "subcatexpense-"
    const expensesInput = document.querySelectorAll('[id^="subcatexpense-"]');

    // Konverterer NodeList til array og mapper hvert input-felt til et objekt
    const expenses = Array.from(expensesInput).map(input => ({
        username: username,
        subcategoryId: input.id.split('-')[1],
        amount: parseFloat(input.value) // Konverterer input-feltets værdi til et flydende tal og tilføjer det til objektet
    }));

    console.log('Saving all expenses by subcategory:', expenses);
    const options = makeOptions("POST", expenses, true);

    try {
        const response = await fetch(URL + '/expenses/addExpenses', options);
        const result = await handleHttpErrors(response);
        console.log('Expenses saved successfully:', result);
        fetchExpenses();
    } catch (error) {
        console.error('There was a problem saving expenses:', error);
    }
}

// Sletter en udgift
async function deleteExpenses(expensesId) {
    // Gemmer alle ændringer før sletning
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
    // Henter opdaterede udgifter fra serveren
    fetchExpenses();
}

// Tilføjer en kategori
async function addCategory() {
    let username = getUserFromLocalStorage();
    // Henter det valgte kategori-id fra dropdown-menuen
    const categorySelect = document.getElementById('expenseCategorySelect');
    const categoryId = categorySelect.value;

    // Hvis ingen kategori er valgt, logges en fejlbesked og funktionen afsluttes
    if (!categoryId) {
        console.error('No category selected.');
        return;
    }

    // Opretter et objekt for en ny underkategori med standardnavnet 'Diverse'
    const subcategory = {
        categoryId: categoryId,
        name: 'Diverse',
        username: username
    };

    // Sender den nye underkategori til serveren
    postSubcategory(subcategory);
    // Gemmer alle ændringer
    await saveAll();
    console.log(`Attempting to add a default subcategory to category ID: ${categoryId}`);
}

// Tilføjer en underkategori
async function addSubcategory(button) {
    let username = getUserFromLocalStorage();
    // Finder input-feltet for underkategori ved at tage det foregående søskende element af knappen
    const subcategoryInput = button.previousElementSibling;
    // Henter kategori-id fra data-attributten på input-feltet
    const categoryId = subcategoryInput.dataset.categoryId;
    // Renser og trimmer værdien i input-feltet for at få underkategorinavnet
    const subcategoryName = purifyDOM(subcategoryInput.value.trim()); // trim fjerner unødvendige tegn, som mellemrum

    // Tjekker om enten kategori-id eller underkategorinavn mangler
    if (!categoryId || !subcategoryName) {
        console.error('Category ID or subcategory name is missing.');
        return;
    }

    // Opretter et objekt for den nye underkategori
    const subcategory = {
        categoryId: categoryId,
        name: subcategoryName,
        username: username
    };
    // Sender den nye underkategori til serveren
    await postSubcategory(subcategory);
    // Gemmer alle ændringer
    await saveAll();
}

// Sender en underkategori til API
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
