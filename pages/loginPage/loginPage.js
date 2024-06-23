import { LOCAL_API as API_URL } from "../../settings.js"
import { handleHttpErrors, makeOptions } from "../../utils.js"
import { roleHandler } from "../../index.js"

const URL = API_URL + "/auth/login";

export function initLogin() {
    console.log("==>> login.js Hello from here");
    listenLogin(); // Lyt efter login
}

async function listenLogin(evt) {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        console.log('entering login.');
        if (this.checkValidity()) {
            event.preventDefault();
            connectLogin(); // Forbind til login
        } else {
            event.preventDefault();
            alert('Venligst udfyld alle felter'); // Vis fejlbesked hvis felter mangler
        }
    });
}

async function connectLogin() {
    // Tilføjet DOMPurify.sanitize for sikkerhed mod XSS-angreb
    const loginInfo = {
        "username": DOMPurify.sanitize(document.getElementById("username").value),
        "password": DOMPurify.sanitize(document.getElementById("password").value)
    };
    login(loginInfo); // Udfør login
}

export async function login(loginInfo) {
    const userDto = { "username": loginInfo.username, "password": loginInfo.password };
    console.log(userDto);

    const options = makeOptions("POST", userDto, false); // Opret POST-anmodningsindstillinger

    try {
        const response = await fetch(URL, options).then(res => handleHttpErrors(res));
        localStorage.setItem("user", response.username); // Gem bruger i localStorage
        localStorage.setItem("token", response.token); // Gem token i localStorage
        localStorage.setItem("roles", response.roles); // Gem roller i localStorage

        console.log(response);

        await roleHandler(); // Håndter roller

        window.router.navigate("/menu"); // Naviger til menu
    } catch (err) {
        document.getElementById("loginError").innerHTML = err.message; // Vis fejlbesked
    }
}

export async function logout() {
    document.getElementById("login").style.display = "block"; // Vis login
    document.getElementById("signIn").style.display = "block"; // Vis sign in
    document.getElementById("logout").style.display = "none"; // Skjul logout
    window.router.off("/logout");

    localStorage.clear(); // Ryd localStorage

    await roleHandler(); // Håndter roller

    window.router.navigate("/menu"); // Naviger til menu
}
