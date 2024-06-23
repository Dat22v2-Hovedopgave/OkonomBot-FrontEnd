import "https://unpkg.com/navigo"; // Opretter global Navigo objekt brugt nedenfor
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
import { initMenu } from "./pages/menuPage/menuPage.js";

let templates = {};

// Håndter sideindlæsning
window.addEventListener("load", async () => {
  // Indlæs skabeloner
  templates.templateAbout = await loadTemplate("./pages/aboutPage/aboutPage.html");
  templates.templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  templates.templateBudget = await loadTemplate("./pages/budgetPage/budgetPage.html");
  templates.templateLogin = await loadTemplate("./pages/loginPage/loginPage.html");
  templates.templateSignIn = await loadTemplate("./pages/signInPage/signInPage.html");
  templates.templateMenu = await loadTemplate("./pages/menuPage/menuPage.html");

  adjustForMissingHash(); // Juster for manglende hash

  await starterRoutes(); // Start ruter

  console.log("routehandler done");
});

// Debugging
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

// Definer ruter og deres handlinger
export async function starterRoutes(){
  const router = new Navigo("/", { hash: true });
  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu-id", match.url); // Sæt aktivt link
        done();
      },
    })
    .on({
      "/about": () => {
        renderTemplate(templates.templateAbout, "content");
        testEverything(); // Initialiser "about" side
      },
      "/menu": () => {
        renderTemplate(templates.templateMenu, "content");
        initMenu(); // Initialiser menu side
      },
      "/login": () => {
        renderTemplate(templates.templateLogin, "content");
        initLogin(); // Initialiser login side
      },
      "/signIn": () => {
        renderTemplate(templates.templateSignIn, "content");
        initSignIn(); // Initialiser sign in side
      }
    });

  console.log('Window router after starterRoutes ', window.router);

  router.notFound(() => {
    renderTemplate(templates.templateNotFound, "content"); // Håndter ikke fundet side
  }).resolve();
}

// Håndter roller
export async function roleHandler() {
  if (localStorage.getItem("user")) {
    userRoutes(); // Hvis bruger er logget ind
  } else {
    anonymousRoutes(); // Hvis bruger er anonym
  }
}

// Ruter for loggede ind brugere
async function userRoutes(){
  console.log("found a user! Showing things a user can see.");

  document.getElementById("signIn").style.display = "none";
  window.router.off("/signIn");

  document.getElementById("login").style.display = "none";
  window.router.off("/login");

  // Vis logout og budget
  document.getElementById("logout").style.display = "block";
  document.getElementById("budget").style.display = "block";

  window.router.on({
    "/logout": () => {
      logout(); // Initialiser logout
    },
    "/budget": () => {
      renderTemplate(templates.templateBudget, "content");
      initBudget(); // Initialiser budget side
    }
  });
}

// Ruter for anonyme brugere
async function anonymousRoutes(){
  console.log("didn't find a user! Showing things anonymous can see.")

  document.getElementById("budget").style.display = "none";
  window.router.off("/budget");

  document.getElementById("login").style.display = "block";
  document.getElementById("signIn").style.display = "block";

  window.router.on({
    "/login": () => {
      renderTemplate(templates.templateLogin, "content");
      initLogin(); // Initialiser login side
    },
    "/signIn": () => {
      renderTemplate(templates.templateSignIn, "content");
      initSignIn(); // Initialiser sign in side
    }
  });
}

// Ruter for admin (fremtidig implementering)
async function adminRoutes(){
  // Admin ruter her
}
