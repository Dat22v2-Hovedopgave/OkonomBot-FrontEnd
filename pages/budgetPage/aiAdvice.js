import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors } from "../../utils.js";

export async function initAdvice(){
    console.log('==>> advicePage.js Hello from here');

    setupAdviceButton();
}

async function setupAdviceButton(){

    const username = localStorage.getItem('user');
    const button = document.getElementById('getAdviceButton');

    button.addEventListener('click', async function(event) {

        document.getElementById("advice-text").innerHTML = 'Loading . . .';

        if(username){
            try {
                const userInfo = await getUserEcoInfo(username);
                askGPT(userInfo);
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

    const gptDto = { "message": userInfo };
    console.log(gptDto);
    const options = makeOptions("POST",gptDto,false);
  
    try {
      const response = await fetch(URL + '/ai/', options).then(res=>handleHttpErrors(res));

      console.log("Svar fra gpt: ",response);

      typeOutResponse(response);
      //document.getElementById("advice-text").innerHTML = response.message;

    } catch (error) {
      document.getElementById("error").innerText = error.message
    }
}

function typeOutResponse(responseMessage) {
    const TYPESPEEDINMS = 30; // Speed of typing in milliseconds
    const element = document.getElementById("advice-text"); // Target element
    const response = responseMessage.message; // Message to be typed out

    console.log("response: ",response);

    element.textContent = ''; // Clear the element content
    element.style.borderRight = '2px solid black'; // Add cursor

    let index = 0; // Initial index to start typing from
    const intervalId = setInterval(() => {
        if (index < response.length) {
            element.textContent += response.charAt(index);
            index++;
        } else {
            clearInterval(intervalId);
            element.style.borderRight = 'none'; // Remove cursor after typing
        }
    }, TYPESPEEDINMS);
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