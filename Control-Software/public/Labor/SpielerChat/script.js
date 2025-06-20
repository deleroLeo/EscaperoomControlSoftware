/* Polizeichat Version 22a */

/* Zur Nachverfolgung der Logik: HTML Divs sind nach Q (für Question) gegliedert
 * Q steht hier im breiteren Sinne für die Antwortmöglichkeiten auf gestellte Fragen/Aufgaben
 * Die Qs sind jetzt im Miro neben den Antworten eingetragen.
 * Von der Frage kann man der "onclick" Funktion folgen und auslesen was passiert.
 * d.h. idR. Player Text, Polizei Antwort und ein Timer für die nächste Polizeinachricht und das Anzeigen der Antwortmöglichkeiten.
 * showMessage(bPolice, MessageID) zeigt die Nachricht sofort. 
 * bPolice sagt aus ob es eine Polizei(true) oder Player (false) Nachricht sein soll
 * msgID sucht die Nachricht aus dem korrespondierenden Array.
 * Achtung: Arrays fangen bei 0 an -> msgInterval[3] gibt die 4. Zahl der Liste aus.
 * new Police Message hat automatisch ein Delay in dem "..." für tippen angezeigt wird bevor die Nachricht erscheint.
 * es bekommt ebenfalls die ID fürs Array.
 * -> HTML Button -> Funktion -> Array auslesen, oder HTML -> Miro checken
*/

/* Socket Code */


// Load UserData from localStorage
let currUsr = localStorage.getItem("username");
let currRoom = localStorage.getItem("room");
// if issues come up with the data, clear it and redirect back to the login page

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

//Receives a regular chat message.
socket.on('message', (message) => {
    //console.log(message);
    outputMessage(message);
});

const chatForm = document.getElementById('chat-form');
//used to differentiate between own and police messages.
var currentSentMessage = "";
// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }
    currentSentMessage = msg;
    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message) {
    let currentHeader = checkHeader(message);
    $("#typing").before(currentHeader + message.text);
    scrollToLatest();
}

function checkHeader(message) {
    if (currentSentMessage == message.text) {
        return msgYouHead;
    } else {
        setTimeout(() => {
            $("#sfx-notify")[0].play();
        }, 200);
        return msgTheyHead;
    }
}






const msgTheyHead = "<div class='message they'><p class='they'>";
const msgYouHead = "<div class='message you'><p class='you'>";
const msgEnd = "</p></div>"
/* messages more or less in order, wrapped by the divs above. y=yes, n=no, m=maybe, d=data, f=failed*/


/

// set height of chat history
function updateLayout() {
    //let navHeight = $("#nav-bar").outerHeight(true);
    let sekHeight = $("#sek-header").outerHeight(true);
    let choiceHeight = $("#chat-choices").outerHeight(true);
    let windowHeight = $(window).height();
    //let chatHeight = (windowHeight - (navHeight + choiceHeight)) + "px";
    let chatHeight = (windowHeight - (sekHeight + choiceHeight)) + "px";
    //$("#chat-verlauf").css({"max-height": chatHeight, "height": chatHeight, "margin-top": navHeight});
    $("#chat-verlauf").css({ "max-height": chatHeight, "height": chatHeight, "margin-top": 0 });
}

function scrollToLatest() {
    $("#chat-verlauf").scrollTop($("#chat-verlauf")[0].scrollHeight);
}

/* On Page Loaded */
$(document).ready(function () {
    updateLayout();
    $(window).resize(updateLayout);
    setTimeout(() => {
        showMessage(0, true, false);
        showMessage(1, true, false);
    }, 200);
    
});
