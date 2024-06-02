console.log("Trying to load signInPage!")
import { makeOptions, handleHttpErrors } from "../../utils.js";
import { LOCAL_API as API_URL } from "../../settings.js";
import { login } from "../loginPage/loginPage.js";

const URL = API_URL + "/users/createUser";


export function initSignIn(){

    console.log("Loading initSignIn")

    //Gather user information.
    document.querySelector('form').addEventListener('submit', function(event) {

    if(this.checkValidity()){
      event.preventDefault();
      const user = getUserDetails();

      console.log("User: ",user);

      if(user){
        signUp(user);
      }

    } else {
      event.preventDefault();
      console.log("Not valid");
      throw new Error('Venligst udfyld alle felter');
    }
  })

  showOrHidePassword();

}

function showOrHidePassword(){
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

    const user = {
      "email" : document.getElementById("email").value,
      "username" : document.getElementById("username").value,
      "password" : document.getElementById("password").value
    }

    console.log(user);

    const signInMessage = document.getElementById("signInMessage");

    if (user.username.length <= 5) {
        signInMessage.innerHTML = "Venligst vælg et brugernavn som er længere end 5 bogstaver";
        console.log("Venligst vælg et brugernavn som er længere end 5 bogstaver");
        return null;
    }
    if (user.password.length <= 5) {
        signInMessage.innerHTML = "Venligst vælg et password som er længere end 5 bogstaver";
        console.log("Venligst vælg et password som er længere end 5 bogstaver");
        return null;
    }
    if (user.email.length <= 5) {
        signInMessage.innerHTML = "Venligst vælg en email som er længere end 5 bogstaver";
        console.log("Venligst vælg en email som er længere end 5 bogstaver");
        return null;
    }
    if (!user.email.includes('@') || !user.email.includes('.')) {
        signInMessage.innerHTML = "Venligst indtast en gyldig email";
        console.log("Venligst indtast en gyldig email");
        return null;
    }
    signInMessage.innerHTML = "";  // Clear the error if all checks pass

    return user;
}

async function signUp(user) {

  const options = makeOptions("POST", user, false);

  try {
      await fetch(URL,options).then(handleHttpErrors)
      document.getElementById("signInMessage").innerHTML = "Konto oprettet."
      document.querySelector("form").reset();

      await login(user);

  } catch (err) {
      document.getElementById("signInMessage").innerHTML = err
  }
  
}
