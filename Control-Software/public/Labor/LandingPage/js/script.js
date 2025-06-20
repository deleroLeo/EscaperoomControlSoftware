// comparison Data
const dataVersion = "0.11";


/* on button press set the username and target page */
function sendData(username) {
    //document.getElementById('username').value = username;
    //set values
    //let currentRoom = document.getElementById("room").value;
    //Room kann hier rausgenommen werden, da eigentlich nur noch der Username (Also ob Darkchat/Controller/Polizeichat) wichtig ist.
    localStorage.setItem("version", dataVersion);
    localStorage.setItem("username", username);
    //localStorage.setItem("room", currentRoom);

    tryRedirect();
        
    
}

function tryRedirect() {
    let username = localStorage.getItem("username");
    switch (username) {

        case "Spieler":
            window.open("SpielerChat/index.html", "_self");
            break;
        case "Controller":
            window.open("Controller/index.html", "_self");
            break;
    }

}

document.addEventListener("DOMContentLoaded", function () {
    // get saved parameters from localStorage
    let version = localStorage.getItem("version");
    let username = localStorage.getItem("username");
    let room = localStorage.getItem("room");

    //if all values are set
    if (version && username && room) {
        //console.log(version && password && username && room);
        //console.log("all parameters are set"); 

        // check if data is up to date and pw matches.
        if (version === dataVersion) {
            //console.log("data is up-to-date and password is true"); 

            // automatic redirect
            //console.log("redirecting");
            //tryRedirect();
        } else {
            //show login form
            //console.log("Error: Version out of date or password is wrong"); 
        }
    } else {
        // console.log("Parameters are missing"); 
    }
    setTimeout(() => {
        document.getElementById('main-container').classList.remove("hidden");
    }, 200);


});
