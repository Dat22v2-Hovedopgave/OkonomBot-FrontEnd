console.log("Trying to load signInPage!")
import { makeOptions, handleHttpErrors } from "../../utils.js";
import { LOCAL_API as API_URL } from "../../settings.js";
import { login } from "../loginPage/loginPage.js";

const URL = API_URL + "/users/createUser";


export function initSignIn(){

    console.log("Loading initSignIn")

    //Gather user information.
    document.getElementById("btn-signUp").onclick = (event) => {
      event.preventDefault();
      const user = getUserDetails();
      signUp(user);
    }

    //Show or hide password.
    const passwordInput = document.getElementById('password');
    const showPasswordButton = document.getElementById('show-password');
    
    showPasswordButton.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordButton.textContent = 'Hide Password';
      } else {
        passwordInput.type = 'password';
        showPasswordButton.textContent = 'Show Password';
      }
    });

}

function getUserDetails(){
    const user = {}

    user.email = document.getElementById("email").value
    user.username = document.getElementById("username").value
    user.password = document.getElementById("password").value

    console.log(user)

    return user;
}

async function signUp(user) {
  
  const options = makeOptions("POST", user, false);

  try {
      await fetch(URL,options).then(handleHttpErrors)
      document.getElementById("sysmessage").innerHTML = "Konto oprettet."
      document.querySelector("form").reset();

      await login(user);

      //window.router.navigate("/menu");
  } catch (err) {
      document.getElementById("error").innerHTML = err
  }
  
}
