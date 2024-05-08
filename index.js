import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";
import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
  handleHttpErrors,
} from "./utils.js";

//import{LOCAL_API as URL} from "./settings.js"

import { testEverything } from "./pages/aboutPage/aboutPage.js";
import { initBudget } from "./pages/budgetPage/budgetPage.js";
import { initLogin, logout } from "./pages/loginPage/loginPage.js";
import { initSignIn } from "./pages/signInPage/signInPage.js";

let templates = {};

window.addEventListener("load", async () => {
  templates.templateAbout = await loadTemplate("./pages/aboutPage/aboutPage.html");
  templates.templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  templates.templateBudget = await loadTemplate("./pages/budgetPage/budgetPage.html");
  templates.templateLogin = await loadTemplate("./pages/loginPage/loginPage.html");
  templates.templateSignIn = await loadTemplate("./pages/signInPage/signInPage.html");

  adjustForMissingHash();

  await routeHandler();

  console.log("routehandler done");
});

//debug
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};

export async function routeHandler() {

  await defaultRoutes();

  console.log("rolehandler done")
}

export async function defaultRoutes(){

  const router = new Navigo("/", { hash: true });

  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu-id", match.url);
        done();
      },
    })
    .on({
      //For very simple "templates", you can just insert your HTML directly like below
      "/about": () => {
        renderTemplate(templates.templateAbout, "content");
        testEverything();
      },
      "/budget": () => {
        renderTemplate(templates.templateBudget, "content");
        initBudget();
      },
      "/login": () => {
        renderTemplate(templates.templateLogin, "content");
        initLogin();
      },
      "/signIn": () => {
        renderTemplate(templates.templateSignIn, "content");
        initSignIn();
      }
    });

    if (localStorage.getItem("user")) {
      await roleHandler();
    }

    

    router.notFound(() => {renderTemplate(templates.templateNotFound, "content")}).resolve();
}


export async function roleHandler() {
  //if (localStorage.getItem("user")) {

    console.log("found a user! Showing things a user can see.");
    //Everything anyone but the ANONYMOUS can access.

    //Removes sign in, since user has already logged in.
    document.getElementById("signIn").style.display = "none";
    window.router.off("/signin");

    //Removes login, since role was found.
    document.getElementById("login").style.display = "none";
    window.router.off("/login");

    //Shows logout, since role was found.
    document.getElementById("logout").style.display = "block";
    window.router.on({
      "/logout": () => {
        renderTemplate(templates.templateLogin, "content");
        logout();
      },
    });
/*
  } else {
    console.log("didn't find a user! Showing things anonymous can see.");

    window.router.on({
      "/signIn": () => {
        renderTemplate(templates.templateSignIn, "content");
        initSignIn();
      }
    }); 

    window.router.on({
      "/login": () => {
        renderTemplate(templates.templateLogin, "content");
        initLogin();
      },
    });

  }
  */
  //}
}