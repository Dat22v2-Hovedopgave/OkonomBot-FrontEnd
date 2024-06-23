import { LOCAL_API as URL } from "../../settings.js";
import { makeOptions, handleHttpErrors } from "../../utils.js";
import { totalEarnings, totalExpenses } from "./budgetPage.js";

export async function initAdvice() {
    console.log('==>> advicePage.js Hello from here');
    setupAdviceButton(); // Sætter op knappen til at få rådgivning
}

// Setup knap til at få rådgivning
async function setupAdviceButton() {
    const username = localStorage.getItem('user'); // Henter brugernavn fra localStorage
    const button = document.getElementById('getAdviceButton'); // Finder knappen til at få rådgivning

    button.addEventListener('click', async function(event) {
        if (totalEarnings == 0 || totalExpenses == 0) {
            // Viser fejlbesked hvis der ikke er nok data
            document.getElementById('aiError').innerHTML = 'Udfyld venligst flere detaljer om dit budget for at bruge AI assistance.';
        } else {
            document.getElementById('aiError').innerHTML = '';
            document.getElementById("advice-text").innerHTML = 'Tænker . . .'; // Viser tænke besked

            if (username) {
                try {
                    const userInfo = await getUserEcoInfo(username); // Henter brugerens økonomiske info
                    askGPT(userInfo); // Sender info til GPT
                } catch (error) {
                    console.error('Failed to get user info:', error); // Logger fejl
                    alert("Failed to retrieve user information."); // Viser fejlbesked
                }
            } else {
                console.error('Username could not be found.'); // Logger fejl
                alert("Please log in to get advice."); // Viser fejlbesked
            }
        }
    });
}

// Hent brugerens økonomiske oplysninger (indtægter og udgifter)
async function getUserEcoInfo(username) {
    const expenses = await fetchExpenses(username); // Henter brugerens udgifter
    const earnings = await fetchEarnings(username); // Henter brugerens indtægter

    console.log('Expenses for ', username, '. ', expenses);
    console.log('Earnings for ', username, '. ', earnings);

    let sendInfo = formatTransactions(earnings, expenses); // Formaterer transaktionerne

    return sendInfo; // Returnerer formateret info
}

function formatTransactions(earnings, expenses) {
    let result = {
        Indtægter: {}, // Indtægter
        Udgifter: {}, // Udgifter
        totals: {
            totalIndtægt: 0, // Total indtægt
            totalUdgift: 0, // Total udgift
            overskud: 0 // Overskud/underskud
        }
    };

    // Behandl indtægter
    for (const earning of earnings) {
        // Opret kategori hvis den ikke findes
        if (!result.Indtægter[earning.categoryName]) {
            result.Indtægter[earning.categoryName] = {};
        }
        // Tildel beløb til underkategori
        result.Indtægter[earning.categoryName][earning.subcategoryName] = earning.amount;
        // Tilføj til total indtægt
        result.totals.totalIndtægt += earning.amount;
    }

    // Behandl udgifter
    for (const expense of expenses) {
        // Opret kategori hvis den ikke findes
        if (!result.Udgifter[expense.categoryName]) {
            result.Udgifter[expense.categoryName] = {};
        }
        // Tildel beløb til underkategori
        result.Udgifter[expense.categoryName][expense.subcategoryName] = -expense.amount;
        // Tilføj til total udgift
        result.totals.totalUdgift += expense.amount;
    }

    // Beregn overskud eller underskud
    result.totals.overskud = result.totals.totalIndtægt + result.totals.totalUdgift;

    return JSON.stringify(result, null, 2); // Formater som JSON-streng
}


// Send brugerinfo til GPT API og håndter responsen
async function askGPT(userInfo) {
    const gptDto = { "message": userInfo };
    console.log(gptDto);
    const options = makeOptions("POST", gptDto, false); // Opretter indstillinger for POST-anmodning

    try {
        const response = await fetch(URL + '/ai/', options).then(res => handleHttpErrors(res)); // Sender anmodning til GPT
        console.log("Svar fra gpt: ", response);
        typeOutResponse(response); // Skriver svar ud med typningseffekt
    } catch (error) {
        document.getElementById("error").innerText = error.message; // Viser fejlbesked
    }
}

// Skriver svaret ud med typningseffekt
function typeOutResponse(responseMessage) {
    const TYPESPEEDINMS = 30; // Skrivehastighed i millisekunder
    const element = document.getElementById("advice-text");
    const response = responseMessage.message;

    console.log("response: ", response);

    element.innerHTML = ''; // Ryd elementets indhold
    element.style.borderRight = '2px solid black'; // Tilføj cursor

    let index = 0;
    const intervalId = setInterval(() => {
        if (index < response.length) {
            if (response.charAt(index) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += response.charAt(index);
            }
            index++;
        } else {
            clearInterval(intervalId);
            element.style.borderRight = 'none'; // Fjern cursor
        }
    }, TYPESPEEDINMS);
}

// Henter indtægter for en bruger
async function fetchEarnings(username) {
    try {
        const options = makeOptions("GET", '', false); // Opretter indstillinger for GET-anmodning
        const response = await fetch(URL + '/earnings/user/' + username, options).then(res => handleHttpErrors(res)); // Henter indtægter
        return response;
    } catch (error) {
        console.error("Der var et problem med fetchEarnings: " + error.message);
        document.getElementById("error").innerText = error.message; // Viser fejlbesked
    }
}

// Henter udgifter for en bruger
async function fetchExpenses(username) {
    try {
        const options = makeOptions("GET", '', false); // Opretter indstillinger for GET-anmodning
        const response = await fetch(URL + '/expenses/user/' + username, options).then(res => handleHttpErrors(res)); // Henter udgifter
        return response;
    } catch (error) {
        console.error("Der var et problem med fetchExpenses: " + error.message);
        document.getElementById("error").innerText = error.message; // Viser fejlbesked
    }
}
