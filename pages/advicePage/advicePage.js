import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors } from "../../utils.js";

export async function initAdvice(){
    console.log('==>> advicePage.js Hello from here');

    setupAdviceButton();
}

async function setupAdviceButton(){

    const username = localStorage.getItem('user');
    const button = document.getElementById('getAdviceButton');
    console.log(username);

    button.addEventListener('click', async function(event) { // Make the event handler async

        document.getElementById("advice-text").innerHTML = 'Loading . . .';

        if(username){
            try {
                const userInfo = await getUserEcoInfo(username); // Await the async function
                askGPT(userInfo); // Proceed after getUserEcoInfo has completed
            } catch (error) {
                console.error('Failed to get user info:', error);
                alert("Failed to retrieve user information.");
            }
        } else {
            console.error('Username could not be found.');
            alert("Please log in to get advice.");
        }
    });
}
async function getUserEcoInfo(username){

    const expenses = await fetchExpenses(username);
    const earnings = await fetchEarnings(username);

    console.log('Expenses for ',username,'. ',expenses);
    console.log('Earnings for ',username,'. ',earnings);

    let sendInfo = formatTransactions(earnings, expenses);

    return sendInfo;
}

function formatTransactions(earnings, expenses) {
    let result = "Earnings:";

    // Process earnings - these will have positive amounts
    for (const earning of earnings) {
        result += `Kategori:${earning.categoryName}; Underkategori:${earning.subcategoryName}:${earning.amount};`;
    }

    // Start the expenses section
    result += "Expenses:";

    // Process expenses - these need to be shown with negative amounts
    for (const expense of expenses) {
        result += `Kategori:${expense.categoryName}; Underkategori:${expense.subcategoryName}:-${expense.amount};`;
    }

    return result;
}



async function askGPT(userInfo){

    //let message = document.getElementById("advice-text").innerHTML;
    const gptDto = { "message": userInfo };
    console.log(gptDto);
    const options = makeOptions("POST",gptDto,false);
  
    try {
      const response = await fetch(URL + '/ai/', options).then(res=>handleHttpErrors(res));

      console.log(response);

      document.getElementById("advice-text").innerHTML = response.message;

    } catch (error) {
      document.getElementById("error").innerText = error.message
    }
}

async function fetchEarnings(username) {
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/earnings/user/' + username, options).then(res=>handleHttpErrors(res));
        return response
    } catch (error) {
        console.error("There was a problem with the fetchEarnings: " + error.message);
        document.getElementById("error").innerText = error.message
    }
}

async function fetchExpenses(username) {
    try {
        const options = makeOptions("GET", '', false);
        const response = await fetch(URL + '/expenses/user/' + username, options).then(res=>handleHttpErrors(res));
        return response;
    } catch (error) {
        console.error("There was a problem with the fetchExpenses: " + error.message);
        document.getElementById("error").innerText = error.message
    }
}