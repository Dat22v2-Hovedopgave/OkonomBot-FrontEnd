    import { LOCAL_API as URL } from "../../settings.js";
    import { makeOptions, handleHttpErrors, renderTemplate } from "../../utils.js";


    
    var totalEarnings = 0;
    let earningsCategories = [];
    let expenseCategories = [];
    
    export function initBudget() {
        console.log('==>> budgetpage.js Hello from here');
        fetchCategories();
        let username = localStorage.getItem("user"); //skal ændres til at hente username fra localstorage
        
        if(username){
            fetchEarnings(username);
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
          <option selected>Choose...</option>`;
        earningsCategories.forEach(cat => {
            htmlContent += `<option value="${cat.categoryId}">${cat.name}</option>`;
        });
        htmlContent += `</select>
        <button class="btn btn-outline-secondary" type="button" id="create-category-button">Create Category</button>
        </div>`;
        
        // Build HTML content for each category
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
        // Tilføj en knap til at gemme alle earnings
        htmlContent += `<hr><br><button id="save-all-button" class="btn btn-primary">Save All</button>`;
    
        earningsContainer.innerHTML = htmlContent;
        attachEventListeners();
        updateIncomeTotal();
    }        

    async function fetchCategories() {
        const options = makeOptions("GET", '', false);
    
        try {
            const response = await fetch(URL + '/categories/', options);
            const categories = await handleHttpErrors(response);
            earningsCategories = categories.filter(category => category.type === 'earning');
            expenseCategories = categories.filter(category => category.type === 'expense');
    
            // Example usage: Render these categories or handle them as needed
            console.log('Earnings Categories:', earningsCategories);
            console.log('Expense Categories:', expenseCategories);
    
        } catch (error) {
            console.error("There was a problem with the fetch operation: " + error.message);
        }
    }
    
    async function fetchEarnings(username) {
        const options = makeOptions("GET", '', false); 

        try {
            const earnings = await fetch(URL + '/earnings/user/' + username, options)
                .then(handleHttpErrors); 
            renderEarnings(earnings);
        } catch (error) {
            console.error("There was a problem with the fetch operation: " + error.message);
        }
    }

    
    function saveAllEarnings(){
        const earningsInputs = document.querySelectorAll('[id^="subcat-"]');
        const earnings = Array.from(earningsInputs).map(input => ({
            username: username,
            subcategoryId: input.id.split('-')[1],
            amount: parseFloat(input.value)
        }));

        console.log('Saving all earnings by subcategory:', earnings);
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

        console.log('Adding a subcategory...' + subcategory.name);
        console.log('Category ID: ' + categoryId);
        postSubcategory(subcategory);
    }

    function postSubcategory(subcategory) {
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
        console.log('Adding subcategory:', subcategory.name, 'to category ID:', subcategory.categoryId);
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

    function attachEventListeners() {
        const saveButton = document.getElementById('save-all-button');
        saveButton.addEventListener('click', saveAllEarnings);
        
        const addCategoryButton = document.getElementById('create-category-button');
        addCategoryButton.addEventListener('click', addCategory);

        const addSubcategoryButtons = document.querySelectorAll('.add-subcategory');
        addSubcategoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                addSubcategory(this);
            });
        });
    }

    function updateIncomeTotal() {
        const incomeTotal = document.getElementById('income-total');
        incomeTotal.value = totalEarnings;
        totalEarnings = 0;
    }
    