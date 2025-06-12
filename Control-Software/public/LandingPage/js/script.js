// comparison Data

function sendData() {
    //document.getElementById('username').value = username;
    //set values
    let currentRoom = document.getElementById("room").value;
    localStorage.setItem("room", currentRoom);
    tryRedirect();
        
    
}

function tryRedirect() {
    let room = localStorage.getItem("room");
    switch (room) {
        case "R14C":
            window.open("R14C/index.html", "_self");
            break;
        case "Z-immun":
            window.open("./Z-immun/index.html", "_self");
            break;
        case "Labor":
            window.open("Labor/index.html", "_self");
            break;
        case "Buch7Siegel":
            window.open("Buch7Siegel/index.html", "_self");
    }

}
