import { LOCAL_API as API_URL } from "../../settings.js"
import { handleHttpErrors, makeOptions } from "../../utils.js"
import { defaultRoutes, roleHandler, routeHandler } from "../../index.js"

const URL = API_URL + "/auth/login";

export function initLogin() {
  console.log("attempting Logging in");
  listenLogin();
}

async function listenLogin(evt) {
  document.getElementById('loginForm').addEventListener('submit', function(event) {

    console.log('entering login.');

    if(this.checkValidity()){
      event.preventDefault();
      connectLogin();
    } else {
      event.preventDefault();
      alert('Please fill out all fields');
    }
  });
}

async function connectLogin(){
    //Added DOMPurify.sanitize to add security. With this we prevent cross-site scripting (XSS) attacks and other types of malicious code injection.
    const username = DOMPurify.sanitize(document.getElementById("username").value)
    const password = DOMPurify.sanitize(document.getElementById("password").value)
  
    const userDto = { "username":username, "password":password };
    
    console.log(userDto);
  
    const options = makeOptions("POST",userDto,false);
  
    try {
      const response = await fetch(URL, options).then(res=>handleHttpErrors(res));
      localStorage.setItem("user",response.username);
      localStorage.setItem("token",response.token);
      localStorage.setItem("roles",response.roles);
  
      console.log(response);

      roleHandler();

      window.router.navigate("/about");
    } catch (err) {
      //Make sure that the error ID is the correct one.
      document.getElementById("error").innerText = err.message
    }

  }
    export async function logout(){
    
      document.getElementById("login").style.display="block"
      document.getElementById("signIn").style.display="block"
      document.getElementById("logout").style.display="none"
      
      localStorage.clear();

      await routeHandler();

      window.router.navigate("/about");
    }