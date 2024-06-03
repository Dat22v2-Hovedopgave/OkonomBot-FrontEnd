export function initMenu(){

    console.log("hello from initMenu");

    document.getElementById("tryCalculator").addEventListener("click", function() {

        if (localStorage.getItem("user")) {
            window.router.navigate("/budget");
        } else {
            window.router.navigate("/login");
        }
    });
}