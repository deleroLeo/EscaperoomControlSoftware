const chat = document.getElementById('chat-log');

const s1 = document.getElementById('section1');
const s2 = document.getElementById('section2');
const s3 = document.getElementById('section3');

const c1 = document.getElementById('chat1');
const c2 = document.getElementById('chat2');
const c3 = document.getElementById('chat3');

var currentStatus = 0;


// Load UserData from localStorage
let currUsr = localStorage.getItem("username");
let currRoom = localStorage.getItem("room");
// if issues come up with the data, clear it and redirect back to the login page
if (!(currUsr && currRoom)) {
    localStorage.clear();
    window.open("http://abasan.de/", "_self");
}
// Set username and room to the loaded data.
const { username, room } = { username: currUsr, room: currRoom };


const socket = io();

//Handle Connect and Disconnect
var disconnectReason = "unbekannt";
var disconnectCounter = 0;

// Join chatroom on connection.
socket.on('connect', () => {
    socket.emit('joinRoom', { username, room });
    /* console.log('connecting'); */
    if (socket.connected) {
        let notify = document.getElementById("network-notify");
        notify.innerHTML = "&#9888; Verbindung wird wieder hergestellt.";
        setTimeout(() => {
            notify.classList.add("hidden");
        }, 1000);
    }
});

socket.on('disconnect', (reason) => {
    disconnectReason = reason;
    setTimeout(() => {
        if (!(socket.connected)) {
            let notify = document.getElementById("network-notify");
            notify.innerHTML = "&#9888; Verbindungsproblem: " + disconnectReason;
            notify.classList.remove("hidden");
        } else {
            let notify = document.getElementById("network-notify");
            notify.classList.add("hidden");
        }
    }, 4000);
});



// Receives a Status Update from the Server and changes the current status accordingly.
socket.on('status', text => {
    let newStatus = parseInt(text);
    if (currentStatus !== newStatus) {
        currentStatus = newStatus;
        //colour buttons
        switch (currentStatus) {
            case 1:
                s1.classList.remove("hidden");
                s2.classList.add("hidden");
                s3.classList.add("hidden");
                break;
            case 2:
                s2.classList.remove("hidden");
                s1.classList.add("hidden");
                s3.classList.add("hidden");
                document.getElementById("sfx-chat-update").play();
                break;
            case 3:
                s3.classList.remove("hidden");
                s2.classList.add("hidden");
                s1.classList.add("hidden");
                document.getElementById("sfx-chat-update").play();
                break;
            default:
                break;
        }
    }
});


function chat_back() {
    c1.src = "chatauswahl.html";
    c2.src = "chatauswahl_2.html";
    c3.src = "chatauswahl_3.html";
    //console.log("Go Back!!!")
}

/* Von Ingo */
$('#trigger-modal').click(function () {
    $('#overlay, #modal').show();
});

$('#overlay, #modal button').click(function () {
    $('#overlay, #modal').hide();
});
