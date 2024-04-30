import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

export function initBudget() {
    console.log('==>> budgetpage.js Hello from here');
    fetchCategories();
    calculateTotalEarnings();
}
// Function to fetch categories from the API
async function fetchCategories() {

    const options = makeOptions("GET", '', false)

    try {
        const categories = await fetch(URL + '/categories/')
            .then(handleHttpErrors)
        renderCategories(categories);
    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);
    }

function renderCategories(categories) {
     
        console.log(categories)

        const earnings = document.getElementById('earnings-category');
        const expenses = document.getElementById('expenses-category');

        categories.forEach(category => {
            if (category.type === 'expense') {
                const categoryElement = document.createElement('p');
                categoryElement.textContent = `${category.name} (ID: ${category.categoryId})`;
                expenses.appendChild(categoryElement);

            } else if (category.type === 'earning'){
                const categoryElement = document.createElement('p');
                categoryElement.textContent = `${category.name} (ID: ${category.categoryId})`;
                earnings.appendChild(categoryElement);
            }})

    }
}

