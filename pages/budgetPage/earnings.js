import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";
import { purifyDOM, saveAll } from "./budgetPage.js";

export let fetchedEarnings;
let earningsCategories = [];

// Initialiserer indtægter
export async function initEarnings() {
    await fetchCategories();
    await fetchEarnings();
}

// Henter brugernavn fra local storage
function getUserFromLocalStorage() {
    return localStorage.getItem('user');
}

// Henter kategorier fra API
async function fetchCategories() {
    const options = makeOptions("GET", '', false);

    try {
        const response = await fetch(URL + '/categories/', options);
        const categories = await handleHttpErrors(response);
        earningsCategories = categories.filter(category => category.type === 'earning');// Filtrerer kun de kategorier, der er indtægter


        console.log('Earnings Categories:', earningsCategories);

    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// udskriver indtægter på siden
function renderEarnings(earningsData) {
    const earningsContainer = document.getElementById('earnings-category');
    const earningsTotalsContainer = document.getElementById('earnings-category-totals');
    let categories = {};
    let categoryTotals = {};
    
    // Grupperer indtægter efter kategori
    earningsData.forEach(earning => {
        // Hvis kategorien ikke allerede findes i objektet 'categories', så oprettes en ny array for denne kategori
        if (!categories[earning.categoryName]) {
            categories[earning.categoryName] = [];
            // Initialiserer summen for kategorien i objektet 'categoryTotals'
            categoryTotals[earning.categoryName] = 0;
        }
        // Tilføjer indtægten til den relevante kategori
        categories[earning.categoryName].push(earning);
        // Lægger indtægtens beløb til summen for kategorien
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

    // Bygger HTML-indhold for hver kategori inde i et kort
    for (let categoryName in categories) {
        htmlContent += `
        <div class="card text-bg-light mb-3" style="max-width: 30rem;">
          <div class="card-header bg-success text-light">${categoryName}</div>
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
        //Tilføjer et input felt for at tilføje en indtægt, som en underkateogr
        htmlContent += `
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="indtægt kategori..." aria-describedby="add-subcategoryEarning" data-category-id="${categories[categoryName][0].categoryId}">
              <button class="btn btn-outline-secondary add-subcategoryEarning" type="button">Tilføj underkategori</button>
            </div>
          </div>
        </div>`;
    }

    earningsContainer.innerHTML = htmlContent;

    // Viser samlede total for kategoroer inde i kortet til højre
    let totalsHtmlContent = '<h5>Indtægter</h5><hr class="border border-success border-3 opacity-75">';
    for (let categoryName in categoryTotals) {
        totalsHtmlContent += `<p>${categoryName}: ${categoryTotals[categoryName].toFixed(2)} kr.</p>`;
    }
    earningsTotalsContainer.innerHTML = totalsHtmlContent;

    attachEventListeners();
}

// Henter indtægter fra API
async function fetchEarnings() {
    let username = getUserFromLocalStorage();
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/earnings/user/' + username, options);
        const result = await handleHttpErrors(response);

        fetchedEarnings = JSON.parse(JSON.stringify(result)); //Den eneste måde at lave en kopi af objektet i stedet for at henvise til det.
        console.log('Resulting response from fetchEarnings: ', result);
        renderEarnings(result);

    } catch (error) {
        console.error("There was a problem with the fetch operation: " + error.message);
    }
}

// Gemmer alle indtægter
export async function saveAllEarnings() {
    let username = getUserFromLocalStorage();
    // Finder alle input-felter, der har et "id", der starter med "subcatEarning-"
    const earningsInputs = document.querySelectorAll('[id^="subcatEarning-"]');

    // Konverterer NodeList til array og mapper hvert input-felt til et objekt
    const earnings = Array.from(earningsInputs).map(input => ({
        username: username,
        subcategoryId: input.id.split('-')[1],
        amount: parseFloat(input.value) //Hvis strengen indeholder gyldige numeriske tegn, returnerer parseFloat det tilsvarende tal
    }));

    console.log('Saving all earnings by subcategory:', earnings);
    const options = makeOptions("POST", earnings, true);

    try {
        const response = await fetch(URL + '/earnings/addEarnings', options);
        const result = await handleHttpErrors(response);
        console.log('Earnings saved successfully:', result);
        fetchEarnings();
    } catch (error) {
        console.error('There was a problem saving earnings:', error);
    }
}

// Tilføjer en kategori
async function addCategory() {
    let username = getUserFromLocalStorage();
    
    // Henter det valgte kategori-id fra dropdown-menuen
    const categorySelect = document.getElementById('earningCategorySelect');
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
    await postSubcategory(subcategory);
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
    //Puryfier input og henter input
    const subcategoryName = purifyDOM(subcategoryInput.value.trim());//trim fjerner unødvendige tegn, som mellemrum

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

// Sletter en indtægt
async function deleteEarning(earningId) {
    // Gemmer alle ændringer før sletning
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
    // Henter opdaterede indtægter fra serveren
    fetchEarnings();
}


// Tilføjer event listeners
function attachEventListeners() {
    // Finder knappen til at tilføje en ny kategori og tilføjer en klik-begivenhedshåndterer
    const addCategoryButton = document.getElementById('create-earning-category-button');
    addCategoryButton.addEventListener('click', addCategory);

    // Finder alle knapper til at tilføje en ny underkategori og tilføjer en event-listener til hver
    const addSubcategoryButtons = document.querySelectorAll('.add-subcategoryEarning');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            addSubcategory(this); // this refererer til den aktuelle knap
        });
    });

    // Finder alle knapper til at slette en indtægt og tilføjer en event-listener til hver
    const deleteButtons = document.querySelectorAll('[id^="deleteEarning-"]'); // Finder alle knapper, der har et id, der starter med "deleteEarning-"

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            deleteEarning(this.id.split('-')[1]); // this refererer til den aktuelle knap, og split deler id'et for at få earningId
        });                                      // id="deleteEarning-1" bliver til ["deleteEarning", "1"]
    });
}

