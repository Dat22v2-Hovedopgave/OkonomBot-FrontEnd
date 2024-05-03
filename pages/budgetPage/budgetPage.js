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
            const earnings = await fetch(URL + '/earnings/user/' + userId, options)
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
                htmlContent += '<h6>' + earning.subcategoryName + " Subcategory ID: " + earning.subcategoryId + '</h6>'; // Subcategory name
                htmlContent += '<input type="text" class="form-control mb-3" value="' + earning.amount + '" id="subcat-' + earning.subcategoryId + '">';
                totalEarnings += earning.amount;
            });
        }
        // Append a single save button at the end
        htmlContent += `<button id="save-all-button" class="btn btn-primary">Save All</button>`;
    
        earningsContainer.innerHTML = htmlContent;
        attachEventListeners();
        updateIncomeTotal();
    }
    
    
    function attachEventListeners() {
        const saveButton = document.getElementById('save-all-button');
        saveButton.addEventListener('click', saveAllEarnings);
    }
    
    function saveAllEarnings() {
        const earningsInputs = document.querySelectorAll('[id^="subcat-"]');
        const earnings = Array.from(earningsInputs).map(input => ({
            userId: userId,
            subcategoryId: input.id.split('-')[1],
            amount: parseFloat(input.value)
        }));

        console.log('Saving all earnings by subcategory:', earnings);
        saveEarnings(earnings);
    }
    
    function saveEarnings(earnings){
        const options = makeOptions("POST", earnings, true);
        fetch(URL + '/earnings/addEarnings', options)
            .then(handleHttpErrors)
            .then(response => {
                console.log('Earnings saved successfully:', response);
                fetchEarnings(userId);
            })
            .catch(error => {
                console.error('There was a problem saving earnings:', error);
            });

    }
    


    function updateIncomeTotal() {
        const incomeTotal = document.getElementById('income-total');
        incomeTotal.value = totalEarnings;
        totalEarnings = 0;
    }