export function initMenu() {
    console.log("hello from initMenu");

    document.getElementById("tryCalculator").addEventListener("click", function() {
        if (localStorage.getItem("user")) {
            window.router.navigate("/budget"); // Naviger til budget siden hvis bruger er logget ind
        } else {
            window.router.navigate("/login"); // Naviger til login siden hvis bruger ikke er logget ind
        }
    });
}
