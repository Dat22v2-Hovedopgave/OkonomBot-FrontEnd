import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

export function initBudget() {
    console.log('==>> budgetpage.js Hello from here');
    //fetchCategories();
    fetchEarnings(userId);//Skal ændres til username
}
const userId = 1;//Skal ændres til username
var totalEarnings = 0;

async function fetchCategories() {

    const options = makeOptions("GET", '', false)

    try {
        const categories = await fetch(URL + '/categories/')
            .then(handleHttpErrors)
        renderCategories(categories);
    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);
    }

}

// Function to fetch categories from the API
async function fetchEarnings(userId) {//Skal ændres til username
    const options = makeOptions("GET", '', false); // Ensure that makeOptions is properly defined somewhere in your code

    try {
        const earnings = await fetch(URL + '/earnings/user/' + userId)
            .then(handleHttpErrors); // Ensure that handleHttpErrors is properly defined to handle the response
        renderEarnings(earnings);
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

    // Build HTML content for each category
    let htmlContent = '';
    for (let categoryName in categories) {
        htmlContent += '<h3>' + categoryName + '</h3>'; // Category name header
        categories[categoryName].forEach(earning => {
            htmlContent += '<h6>' + earning.subcategoryName + " ID: " + earning.earningId + '</h6>'; // Subcategory name
            htmlContent += '<input type="text" class="form-control mb-3" value="' + earning.amount + '" id="earning-' + earning.earningId + '">';
            htmlContent += `<button class="gem-button" data-earning-id="${earning.earningId}" data-amount="${earning.amount}">Gem</button>`; // Add "Gem" button
            totalEarnings += earning.amount;
        });
        
    }
    updateIncomeTotal();
    earningsContainer.innerHTML = htmlContent;
    attachEventListeners();
}

function attachEventListeners() {
    const buttons = document.querySelectorAll('.gem-button'); // Get all gem buttons
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const earningsId = this.getAttribute('data-earning-id');
            saveEarning(earningsId); // Pass the secret value to your function
        });
    });
}

function saveEarning(earningsId) {
    const amount = document.getElementById('earning-' + earningsId).value;

    const earning = {
        userid: userId, //Skal ændres til username
        id: earningsId,
        amount: amount,
    };
    updateIncomeTotal();

    console.log('Saving earning with secret value: ', earning);

    // // Implement the fetch operation to save the earning
    // const options = makeOptions("PUT", earning, true); // Ensure that makeOptions is properly defined somewhere in your code
    // fetch(URL + '/earnings/' + earningsId, options)
    //     .then(handleHttpErrors)
    //     .then(data => {
    //         console.log('Earning saved: ', data);
    //     })
    //     .catch(error => {
    //         console.error('Error saving earning: ', error);
    //     });    
}


function updateIncomeTotal() {
    const incomeTotal = document.getElementById('income-total');
    incomeTotal.value = totalEarnings;
}










