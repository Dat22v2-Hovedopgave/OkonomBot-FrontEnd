    import { LOCAL_API as URL } from "../../settings.js";
    import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";

    export function initBudget() {
        console.log('==>> budgetpage.js Hello from here');
        fetchEarnings(username);
    }
    const username = "Ferhat";
    var totalEarnings = 0;

    async function fetchCategories() {

        const options = makeOptions("GET", '', false)

        try {
            const categories = await fetch(URL + '/categories/')
                .then(handleHttpErrors)
        } catch (error) {
            console.log("There was a problem with the fetch operation: " + error.message);
        }

    }

    // Function to fetch categories from the API
    async function fetchEarnings(username) {
        const options = makeOptions("GET", '', false); // Ensure that makeOptions is properly defined somewhere in your code

        try {
            const earnings = await fetch(URL + '/earnings/user/' + username, options)
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
            htmlContent += '<h3 class="pt-3">' + categoryName + '</h3>'; // Category name header
            categories[categoryName].forEach(earning => {
                htmlContent += '<h6>' + earning.subcategoryName + " Subcategory ID: " + earning.subcategoryId + '</h6>'; // Subcategory name
                htmlContent += '<input type="text" class="form-control mb-3" value="' + earning.amount + '" id="subcat-' + earning.subcategoryId + '" data-category-id="' + earning.categoryId + '">'; // Add data-category-id attribute
                totalEarnings += earning.amount;
            });
            
            htmlContent += `<div class="input-group input-group-sm mb-3">
            <input type="text" class="form-control" placeholder="type..." aria-describedby="add-subcategory" data-category-id="${categories[categoryName][0].categoryId}">
            <button class="btn btn-outline-secondary add-subcategory" type="button">Add subcategory</button>
            </div>`;
          
        }
        // Append a single save button at the end
        htmlContent += `<hr><br><button id="save-all-button" class="btn btn-primary">Save All</button>`;
    
        earningsContainer.innerHTML = htmlContent;
        attachEventListeners();
        updateIncomeTotal();
    }
    
    
    function attachEventListeners() {
        const saveButton = document.getElementById('save-all-button');
        saveButton.addEventListener('click', saveAllEarnings);

        //const addCategoryButton = document.getElementById('add-category');
        //addCategoryButton.addEventListener('click', addCategory);

        const addSubcategoryButtons = document.querySelectorAll('.add-subcategory');
        addSubcategoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                addSubcategory(this);
            });
        });
    }
    
    function saveAllEarnings() {
        const earningsInputs = document.querySelectorAll('[id^="subcat-"]');
        const earnings = Array.from(earningsInputs).map(input => ({
            username: username,
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
                fetchEarnings(username);
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


    function addSubcategory(button) {
        const addSubcategoryInput = button.previousElementSibling;
        const categoryId = addSubcategoryInput.dataset.categoryId; // Now this should work correctly
        const subcategory = {
            categoryId: categoryId,
            name: addSubcategoryInput.value,
            username: username
        };

        const options = makeOptions("POST", subcategory, false);
        fetch(URL + '/subcategories/addSubcategory', options)
            .then(handleHttpErrors)
            .then(response => {
                console.log('Subcategory added successfully:', response);
                fetchEarnings(username);
            })
            .catch(error => {
                console.error('There was a problem adding the subcategory:', error);
            });
    
        console.log('Adding a subcategory...' + subcategory.name);
        console.log('Category ID: ' + categoryId);
    }

    