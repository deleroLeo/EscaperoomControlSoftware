/*const chatWindow = document.getElementById('chat-window');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');

const btn_01 = document.getElementById('start');
const btn_02 = document.getElementById('drohung');
const btn_03 = document.getElementById('bombe');

const btn_04 = document.getElementById('start');
const btn_05 = document.getElementById('drohung');
const btn_06 = document.getElementById('bombe');*/

var currentStatus = 1;


// Load UserData from localStorage
//let currUsr = "localStorage.getItem("username");"

let currUsr = "Controller";
let currRoom = localStorage.getItem("room");
// if issues come up with the data, clear it and redirect back to the login page
/*if (!(currUsr && currRoom)) {
    localStorage.clear();
    window.open("http://abasan.de/", "_self");
}*/
// Set username and room to the loaded data.
const { username, room } = { username: currUsr, room: currRoom };

const socket = io();

//Handle Connect and Disconnect
var disconnectReason = "unbekannt";
var disconnectCounter = 0;

// Join chatroom on connection.
socket.on('connect', () => {
    socket.emit('joinRoom', { username, room });
    socket.emit('startStreams', (room));
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

//COMMUNICATION-CHAT
/*socket.on('message', (message) => {
    //outputMessage(message);

    //custom ouput message to highlight Player Messages.

    const div = document.createElement('div');
    div.classList.add('message');
	if (message.username == "Controller") {
		div.classList.add('admin-message');
	}
	
	if (message.username == "Spieler") {
		div.classList.add("polizei-message");
	} 
	
    const p = document.createElement('p');
    p.classList.add('meta');


    const timeSpan = document.createElement('span');
    timeSpan.classList.add('player-message');
    timeSpan.innerText = `${message.time} `;

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('player-message');
    nameSpan.innerHTML = message.username;

    const textSpan = document.createElement('span');
    textSpan.classList.add('meta');*/
    /* p.innerText = `${message.time} `;
    p.innerHTML += message.username; */
/*    textSpan.innerText = `:  ${message.text}`;

    p.appendChild(timeSpan);
    p.appendChild(nameSpan);
    p.appendChild(textSpan);

    div.appendChild(p);

    chatLog.appendChild(div);


    // Scroll down
    scrollMessageLog();
});

//Receives a chatlog message.
socket.on('policeLog', (message) => {
    //console.log(message);
    outputMessage(message);

    // Scroll down
    scrollMessageLog();
});



// Receives a Log message from the server and adds it to a log window underneath the buttons.
socket.on('server-log', (message) => {
    //console.log(message);
    outputMessage(message);

    // Scroll down
    scrollMessageLog();
});

function scrollMessageLog() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Receives a Status Update from the Server and changes the current status accordingly.
socket.on('status', text => {
    currentStatus = parseInt(text);

    //colour buttons
    switch (currentStatus) {
        case 1:
            btn_01.classList.add("active");
            btn_02.classList.remove("active");
            btn_03.classList.remove("active");
			
			btn_04.classList.add("active");
            btn_05.classList.remove("active");
            btn_06.classList.remove("active");
            break;
        case 2:
            btn_02.classList.add("active");
            btn_01.classList.remove("active");
            btn_03.classList.remove("active");
			
			btn_05.classList.add("active");
            btn_04.classList.remove("active");
            btn_06.classList.remove("active");
            break;
        case 3:
            btn_03.classList.add("active");
            btn_02.classList.remove("active");
            btn_01.classList.remove("active");
			
			btn_06.classList.add("active");
            btn_05.classList.remove("active");
            btn_04.classList.remove("active");
            break;
        default:
            break;
    }
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

*/

function openElectroHatch(){
    socket.emit('ElectroHatch', 0);
}

function Nebel() {
    socket.emit('shortActivation', 1);
}

function sounds() {
    socket.emit('shortActivation', 2);
}


function updateVentilation(newStatus) {
    socket.emit('update-ventilation', newStatus);
}
function sendMorseCode() {
    socket.emit('send-morse', Eroom);
}
function sendSpyCamPic() {
    socket.emit('send-cam', Eroom);
}

function resetMails() {
    socket.emit('mail-reset', Eroom);
}

// Output message to DOM
// SERVER COMMUNICATION
function outputMessage(message) {
    let parsedMSG = message.text.replaceAll("<br>", "");

    const div = document.createElement('div');
    div.classList.add('message');
	div.classList.add('server-message');
	

    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = `${message.time} `;
    p.innerHTML += message.username;
    p.innerText += `:  ${parsedMSG}`;

    div.appendChild(p);

    chatLog.appendChild(div);

    if (parsedMSG.includes("Sie können sich auf uns verlassen.")) {
        displayHint(checkboxHints[0]);
    }
    scrollMessageLog();
}


/* Countdown */
var countdownTimer;
var bCountdownRunning = false;

function toggleCountdown() {
    if (bCountdownRunning) {
        stopCountdown();
    } else {
        startCountdown();
    }
}

function startCountdown() {
    countdownTimer = setInterval(updateCountdown, 1000);
    bCountdownRunning = true;
    document.getElementById('play-btn').innerHTML = "&#10073;&#10073;";
    document.getElementById('progress-bar').classList.add("progress-bar-anim");
}
function stopCountdown() {
    clearInterval(countdownTimer);
    bCountdownRunning = false;
    document.getElementById('play-btn').innerHTML = "&#9658;";
}
function resetCountdown() {
    stopCountdown();
    document.getElementById('cd-minutes').value = 90;
    document.getElementById('cd-seconds').value = 0;
}

function updateCountdown() {
    const cd_minutes = document.getElementById('cd-minutes');
    const cd_seconds = document.getElementById('cd-seconds');

    if (cd_minutes.value <= 0 && cd_seconds.value <= 0) {
        stopCountdown();
        return false;
    }
    if (cd_seconds.value == 0) {
        cd_minutes.value -= 1;
        cd_seconds.value = 59;
    } else {
        cd_seconds.value -= 1;
    }
}



const checkboxHints = [
    'Start Tipp: Setzen sie nachdem die Spieler*innen sich zurechtgefunden haben einen ersten Funkspruch ab, sodass sie die Funktion des Funkgeräts verstehen',
    "", //Heissen Draht befreit
    "Spieler*innen darauf hinweisen, dass sie die Klappe aushängen können", //Heissen Draht in Stromding gesteckt
    "Beim Roborätsel brauchen einige Spieler*innen intensives Coaching. Nach der Lösung des ROborätsels sollten wenn möglich noch 30min über sein.", //Elektronikverbindung hergestellt
    "Manchmal brauchen Spieler*innen einen kleinen stupps, dass sie die Flügelschrauben vom Airlock abmontieren dürfen", //Roborätsel gelöst
    "Spieler*innen müssen manchmal darauf hingewiesen werden, dass es noch eine Kopfhörerbuchse im Airlock gibt", //Türcodemodul-Sicherheitsklappe abmontiert
    '', //Kopfhörerbuchse gefunden
    "", //Tonreihe in Farben umgewandelt
    "Der Binärcode macht manchen Spieler*innen schwierigkeiten in Schalterpositionen umzuwandeln. Hier hinweisen, dass oben 1 und unten 0 ist.", //Farben in Codetabelle angewandt
    'Manche Spieler*innen vergessen den Open-Button zu drücken', //Türcodemodul richtig eingestellt
    "", //Airlockbutton gedrückt
    
];


/* called when a checkbox is checked */
function showCheckboxHint(id) {
    
    let selector = "step-" + id.toString();
    let checkbox = document.getElementById(selector)
    if (checkbox.checked == true) {
        displayHint(checkboxHints[id]);
    }
}

/* displays the given hint string if not empty*/
function displayHint(hint) {
	if (!(hint === "")) {
		const div = document.getElementById('Hinweisfeld');
		/*div.classList.add('message');
		div.classList.add('hint');*/
        div.textContent = '';
        div.classList.remove("hidden");
        
		
		const p = document.createElement('p');
		p.classList.add('meta');
		p.classList.add('hint-message');
		p.innerText = hint;

		div.appendChild(p);
		/*chatLog.appendChild(div);*/
	}
	/*scrollMessageLog();*/
}

function settings(opened){
	var setting_window = document.getElementById("settings-div");
	if (opened==true) {
		setting_window.classList.add("hidden");
	}
	if (opened==false){
		setting_window.classList.remove("hidden");
    	setting_load(room);

		
	}
	
	
	

}


document.getElementById('settings-form').addEventListener('submit', async (e) => {
	e.preventDefault();
	const formData = new FormData(e.target);
	const settings = Object.fromEntries(formData.entries());
	console.log('saving-in progress');
    socket.emit('settings-save', ({room, settings}) );
  });



function setting_load(){
    console.log("loading in process");
	socket.emit('settings-load', room);

    socket.on('settingLog', (settings) => {
        	
	document.getElementById("Cam1").value = settings.text["Cam1"];
    document.getElementById("Cam2").value = settings.text["Cam2"];
    //document.getElementById("Cam3").value = settings.text["Cam3"];
    //document.getElementById("Cam4").value = settings.text["Cam4"];
	

    });
}


document.addEventListener('DOMContentLoaded', function () {
  function startPlay (videoEl, url) {
    const webrtc = new RTCPeerConnection({
      iceServers: [{
        urls: ['stun:stun.l.google.com:19302']
      }],
      sdpSemantics: 'unified-plan'
    });
    webrtc.ontrack = function (event) {
      console.log(event.streams.length + ' track is delivered');
      videoEl.srcObject = event.streams;
      videoEl.play();
    }
    const webrtcVid = webrtc.addTransceiver('video', { direction: 'sendrecv' });
    const webrtcAud = webrtc.addTransceiver('audio', { direction: 'sendrecv' });
    webrtc.onnegotiationneeded = async function handleNegotiationNeeded () {
      const offer = await webrtc.createOffer();

      await webrtc.setLocalDescription(offer);

      fetch(url, {
        method: 'POST',
        body: new URLSearchParams({ data: btoa(webrtc.localDescription.sdp) })
      })
        .then(response => response.text())
        .then(data => {
          try {
            webrtc.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: atob(data) })
            )
          } catch (e) {
            console.warn(e)
          }
        })
    }

    const webrtcSendChannel = webrtc.createDataChannel('rtsptowebSendChannel')
    webrtcSendChannel.onopen = (event) => {
      console.log(`${webrtcSendChannel.label} has opened`)
      webrtcSendChannel.send('ping')
    }
    webrtcSendChannel.onclose = (_event) => {
      console.log(`${webrtcSendChannel.label} has closed`)
      startPlay(videoEl, url)
    }
    webrtcSendChannel.onmessage = event => console.log(event.data)
  }

  const videoEl = document.querySelector('#webrtc-video')
  const webrtcUrl = document.querySelector('#webrtc-url').value

  const videoE2 = document.querySelector('#webrtc-video2')
  const webrtcUrl2 = document.querySelector('#webrtc-url2').value


  startPlay(videoEl, webrtcUrl)
  startPlay(videoE2, webrtcUrl2)
})