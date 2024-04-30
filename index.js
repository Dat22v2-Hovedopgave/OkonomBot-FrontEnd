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

let templates = {};

window.addEventListener("load", async () => {
  templates.templateAbout = await loadTemplate("./pages/aboutPage/aboutPage.html");
  templates.templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  templates.templateBudget = await loadTemplate("./pages/budgetPage/budgetPage.html");


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

async function routeHandler() {
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
      }
    });

  console.log("rolehandler done")
  router.notFound(() => {renderTemplate(templates.templateNotFound, "content");}).resolve();
}