import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors } from "../../utils.js";
import { totalEarnings, totalExpenses } from "./budgetPage.js";

export async function initAdvice(){
    console.log('==>> advicePage.js Hello from here');

    setupAdviceButton();
}

async function setupAdviceButton(){

    const username = localStorage.getItem('user');
    const button = document.getElementById('getAdviceButton');

    button.addEventListener('click', async function(event) {
        if(totalEarnings == 0 || totalExpenses == 0){
            document.getElementById('aiError').innerHTML = 'Udfyld venligst flere detaljer om dit budget for at bruge AI assistance.';
        } else {
            document.getElementById('aiError').innerHTML = '';

            document.getElementById("advice-text").innerHTML = 'Tænker . . .';

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
        }
    });
}

async function getUserEcoInfo(username) {
    const expenses = await fetchExpenses(username);
    const earnings = await fetchEarnings(username);

    console.log('Expenses for ', username, '. ', expenses);
    console.log('Earnings for ', username, '. ', earnings);

    let sendInfo = formatTransactions(earnings, expenses);

    return sendInfo;
}





function formatTransactions(earnings, expenses) {
    let result = {
        Indtægter: {},
        Udgifter: {},
        totals: {
            totalIndtægt: 0, // Total income
            totalUdgift: 0,   // Total expense
            overskud: 0       // Surplus/deficit
        }
    };

    // Process earnings - these will have positive amounts
    for (const earning of earnings) {
        if (!result.Indtægter[earning.categoryName]) {
            result.Indtægter[earning.categoryName] = {};
        }
        result.Indtægter[earning.categoryName][earning.subcategoryName] = earning.amount;

        if (!result.totals.earnings) {
            result.totals.earnings = {};
        }
        if (!result.totals.earnings[earning.categoryName]) {
            result.totals.earnings[earning.categoryName] = 0;
        }
        result.totals.earnings[earning.categoryName] += earning.amount;
        result.totals.totalIndtægt += earning.amount; // Add to total income
    }

    // Process expenses - these need to be shown with negative amounts
    for (const expense of expenses) {
        if (!result.Udgifter[expense.categoryName]) {
            result.Udgifter[expense.categoryName] = {};
        }
        result.Udgifter[expense.categoryName][expense.subcategoryName] = -expense.amount;

        if (!result.totals.expenses) {
            result.totals.expenses = {};
        }
        if (!result.totals.expenses[expense.categoryName]) {
            result.totals.expenses[expense.categoryName] = 0;
        }
        result.totals.expenses[expense.categoryName] += expense.amount;
        result.totals.totalUdgift += expense.amount; // Add to total expense
    }

    // Calculate surplus or deficit
    result.totals.overskud = result.totals.totalIndtægt + result.totals.totalUdgift;

    return JSON.stringify(result, null, 2); // Format as JSON string with indentation
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

    console.log("response: ", response);

    element.innerHTML = ''; // Clear the element content
    element.style.borderRight = '2px solid black'; // Add cursor

    let index = 0; // Initial index to start typing from
    const intervalId = setInterval(() => {
        if (index < response.length) {
            // Handle new lines and formatting
            if (response.charAt(index) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += response.charAt(index);
            }
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