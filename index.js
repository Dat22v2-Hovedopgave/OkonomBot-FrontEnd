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
import { initAdvice } from "./pages/advicePage/advicePage.js";

let templates = {};

window.addEventListener("load", async () => {
  templates.templateAbout = await loadTemplate("./pages/aboutPage/aboutPage.html");
  templates.templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  templates.templateBudget = await loadTemplate("./pages/budgetPage/budgetPage.html");
  templates.templateLogin = await loadTemplate("./pages/loginPage/loginPage.html");
  templates.templateSignIn = await loadTemplate("./pages/signInPage/signInPage.html");
  templates.templateAdvice = await loadTemplate("./pages/advicePage/advicePage.html");
  templates.templateMenu = await loadTemplate("./pages/menuPage/menuPage.html");

  adjustForMissingHash();

  await starterRoutes();

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

export async function starterRoutes(){

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
      "/menu": () => {
        renderTemplate(templates.templateMenu, "content");
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

    console.log('Window router after starterRoutes ' , window.router);

    router.notFound(() => {renderTemplate(templates.templateNotFound, "content")}).resolve();
}


export async function roleHandler() {
  if (localStorage.getItem("user")) {
    userRoutes();
  } else {
    anonymousRoutes();
  }
  //console.log('Window router after roleHandler ' , window.router);
}

async function userRoutes(){
  console.log("found a user! Showing things a user can see.");

  document.getElementById("signIn").style.display = "none";
  window.router.off("/signIn");

  document.getElementById("login").style.display = "none";
  window.router.off("/login");

  //Shows logout and budget, since role was found.
  document.getElementById("logout").style.display = "block";
  document.getElementById("budget").style.display = "block";
  document.getElementById("advice").style.display = "block";
  window.router.on({
    "/logout": () => {
      logout();
    },
    "/budget": () => {
      renderTemplate(templates.templateBudget, "content");
      initBudget();
    },
    "/advice": () => {
      renderTemplate(templates.templateAdvice, "content");
      initAdvice();
    }
  });
}

async function anonymousRoutes(){
  console.log("didn't find a user! Showing things anonymous can see.")

  document.getElementById("budget").style.display = "none";
  window.router.off("/budget");

  document.getElementById("advice").style.display = "none";
  window.router.off("/advice");

  document.getElementById("login").style.display = "block";
  document.getElementById("signIn").style.display = "block";

  window.router.on({
    "/login": () => {
      renderTemplate(templates.templateLogin, "content");
      initLogin();
    },
    "/signIn": () => {
      renderTemplate(templates.templateSignIn, "content");
      initSignIn();
    }
  });
}

async function adminRoutes(){

}