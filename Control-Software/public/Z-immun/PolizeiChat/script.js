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

// Get username and room from URL
/* const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
 */


// Load UserData from localStorage
//let currUsr = "Spieler"
//let currRoom = "Z-Immun";
// if issues come up with the data, clear it and redirect back to the login page

// Set username and room to the loaded data.
const { username, room } = { username: "Spieler", room: "Z-Immun" };

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
    $("#typing").before(currentHeader + message.text + msgEnd);
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


/* Main Password Box */

const zielgebiet = "bad bodenteich";
const zielgebiet2 = "bodenteich";
// game Over Timer: min * sec * millisec
const gameOverTime = 90 * 60 * 1000;

/* Called when the User presses "senden" on the SEK Zielgebiet input. 
 * if entered correctly the page will be redirected to the winning page.
*/
function checkMainPW() {
    let pw_input = $("#zielgebiet").val();
    let pw_parsed = pw_input.toLowerCase();

    if (pw_parsed == zielgebiet || pw_parsed == zielgebiet2) {
        window.open("http://wa-sek.de/SEK-win.html", "_self");
        //console.log("Funktioniert");
    }
    else {
        //console.log("Funktioniert nicht");
    }
}

const loseTimer = setTimeout(() => {
    window.open("http://wa-sek.de/SEK-fail_1.html", "_self");
}, gameOverTime);



/* Pauses between Message segments. 
* 1000ms are subtracted because police messages have a 1 second delay.
* Time in ms -> 4 min = 4*60*1000 */
const msgPause = [
    (8 * 60 * 1000) - 1000,
    (3 * 60 * 1000) - 1000,
    (4 * 60 * 1000) - 1000,
    (2 * 60 * 1000) - 1000,
    (4 * 60 * 1000) - 1000,
    (3 * 60 * 1000) - 1000,
    (2 * 60 * 1000) - 1000,
    (2 * 60 * 1000) - 1000,
    (8 * 1 * 1000) - 1000,  // seconds!
    (1 * 60 * 1000) - 1000,
    (3 * 60 * 1000) - 1000,
    (2 * 60 * 1000) - 1000
];

/* TESTING ONLY!!! seconds instead of minues!! */
/* const msgPause = [
    (4 * 1000) - 1000,
    (3 * 1000) - 1000,
    (4 * 1000) - 1000,
    (2 * 1000) - 1000,
    (4 * 1000) - 1000,
    (3 * 1000) - 1000,
    (2 * 1000) - 1000,
    (2 * 1000) - 1000,
    (4 * 1000) - 1000,  // seconds!
    (1 * 1000) - 1000,
    (3 * 1000) - 1000,
    (2 * 1000) - 1000
]; */
// Delay between sending and displaying the new message. during this time the "..." is shown.
var msgAnimDelay = 2000;

//Easy way to disable the score system: set bEnableScore to false.
var bEnableScore = false;
var bShowScoreNotify = false;
var playerScore = 0;
var scoreText = "Eure Punktezahl für Hintergrundwissen ist 0 von 100 :(";
/* HTML wrappers for the message div */
const msgTheyHead = "<div class='message they'><p class='they'>";
const msgYouHead = "<div class='message you'><p class='you'>";
const msgEnd = "</p></div>"
/* messages more or less in order, wrapped by the divs above. y=yes, n=no, m=maybe, d=data, f=failed*/
const policeMessages =
    [
        'Guten Morgen. <br> Sie sprechen mit Frau Flaubert. Ich bin die Einsatzleitung des SEK Teams. <br> Sollten Sie feststecken können Sie die Eingabe unten nutzen um Hilfe zu erhalten. <br><br> Dieser Chat ist Ende-zu-Ende verschlüsselt, daher wird der Inhalt gelöscht, falls Sie diese Seite schließen, oder neu laden. ', //
        'Klicken Sie unten auf "Alles klar", um zu bestätigen, dass Sie diese Nachricht erhalten haben.', //
        'Okay, die Kommunikation funktioniert. Das Paket mit den beschlagnahmten Gegenständen müsste jeden Moment bei Ihnen eintreffen. Unser Team steht massiv unter Druck und ist dringend auf Ihre Zuarbeit angewiesen. Machen Sie keine Fehler! Es hängen Menschenleben von Ihren Ermittlungen ab! Viel Erfolg.', //
        'Können wir immer noch davon ausgehen, dass es sich um die Tat eines Einzelnen handelt oder stecken weitere Personen dahinter?', //
        'Das ist beruhigend. Dann können wir unsere Kräfte bündeln.', //
        'Das ist sehr beunruhigend. Wir werden umgehend Verstärkung anfordern und unseren Ermittlungsradius erweitern.', //
        'Uns liegen mittlerweile Erkenntnisse vor, dass der mutmaßliche Attentäter viel Zeit in einer Chatgruppe namens "Darkchat" verbracht hat. Die Mitglieder dieser Chatgruppe scheinen sehr wohl damit in einem ursächlichen Zusammenhang zu stehen. Erlauben Sie sich nicht noch einmal einen solchen Patzer!', //
        'Haben Sie schon eine Ahnung, welche Personen oder Gruppen noch involviert sein könnten?', //
        'Das sehen wir ganz anders, eine dieser Personen muss tiefer involviert sein!', //
        'Das ist ja interessant: Z ist wohl das Pseudonym von Jonas. Das scheint eine heiße Spur zu sein. Bleiben Sie da dran und finden Sie mehr über Jonas heraus.', //
        'Hmmm, das ist sehr interessant. Zoey scheint einen eigenen YouTube Kanal zu haben. Das scheint eine heiße Spur zu sein. Bleiben Sie dran und finden mehr über Zoey heraus.', //
        'Sarah Sand? Ist die nicht irgendein hohes Tier bei sand pharmaceutical? www.sand-pharma.com scheint eine heiße Spur zu sein. Finden Sie mehr über die Hintergründe heraus. ', //
        'In welcher Verbindung steht diese Person zu dem Medikament zerum forte?', //
        'Sehr interessant! Langsam verdichten sich die Indizien und scheinen, sich alle auf sand pharmaceuticals zu konzentrieren.', //
        'Gut, dann richten wir unsere Recherchen in eine andere Richtung.', //
        'Welche Rolle spielt dabei die Heißluftballonmeisterschaft? Cui bono? Folgen Sie der Spur des Geldes. Konnten Sie herausfinden, wer der Hauptsponsor dieses Events ist?', //
        'Das liegt ja nahe. Finden Sie heraus, wer hinter BFC steckt.', //
        'Das ist ja unglaublich! Die Pharmaindustrie hat anscheinend überall ihre Finger im Spiel! Finden Sie heraus, wer hinter sand pharmaceuticals steckt!', //
        'Ausgezeichnet! Wir setzen sofort ein Ermittlerteam darauf an.', //
        'Diese Datei konnten wir soeben sicherstellen, vielleicht hilft Sie Ihnen bei Ihren weiteren Ermittlungsarbeiten.', //
        '<img class="msg-img" src="images/cv_meier.jpg" alt="lebenslauf">', //Replace with filename
        'Wir müssen weiterhin seeehr vorsichtig sein. Die Hinweise verdichten sich, dass unser Ermittlerteam unterwandert ist. Wir könnten umgekehrt versuchen, eine Person aus der Gruppe als Agent*in anzuheuern, um an Informationen zu gelangen. Vielleicht hilft uns das weiter.  Welche Person aus der Gruppe erscheint Ihnen am besten dafür geeignet?', //
        'Wahrscheinlich haben Sie Recht, aber dazu fehlen uns noch etliche Hintergrundinformationen über die Identitäten der Gruppenmitglieder. Dann bleiben wir weiterhin extrem wachsam. Halten auch Sie alle Ohren offen und vertrauen Sie AUSSCHLIESSLICH bis auf weiteres MIR. Sonst keinem!', //
        'Nero? Erzählen Sie keinen Bullshit! Mein Team wartet nur darauf, dass Sie uns endlich den Einsatzort nennen, um Nero alias Christoph Meier dingfest zu machen. Das war keine Hilfe und wird ein Nachspiel haben!', //
        'Ok, mein Team versucht die Identität dieser Person herauszufinden.', //
        'Ok, mein Team wird seine Konzentration darauf legen, die Identität von Z alias Jonas herauszufinden.', //
        'Schaun Sie mal, wir haben ein Audiofile per Telefonüberwachung abfangen können. Das könnte ihnen helfen.', //
        '<audio id="audio-rec" controls src="sounds/audio-recording.wav" autostart="0"></audio>', //Replace with filename
        'Konnten Sie mittlerweile etwas zu den Motiven von Christoph Meier herausfinden, die ihn zu diesem Vorhaben getrieben haben?', //
        'Alles klar, wir werden bei seinem letzten Arbeitgeber Erkundigungen über Herrn Meier einziehen.', //
        'Alles klar, wir werden uns um die Krankenakte kümmern.', //
        'Alles klar, dann sollten wir in der Tat mehr über die Identitäten dieser Gruppe herausfinden. Der Einfluss dieser Gruppe scheint weiter zu greifen, als wir ursprünglich angenommen hatten. Bleiben auch Sie da in jedem Fall dran!', //
        'Hm, seine Überzeugung, etwas Gutes zu tun, indem man ein Attentat begeht?! Das klingt schon sehr verworren. Dazu brauchen wir mehr Informationen.', //
        'Das ist schlecht, aber für den Moment ist der Ermittlung des Einsatzortes dringlicher. Vielleicht können Sie aus dem "Darkchat" Hinweise auf die Motive herausfinden?', // SUPERCHAT REPLACED
        'Unser Ermittlerteam ist dran! Die Recherchen dauern noch! Konzentrieren Sie sich in der Zwischenzeit auf den "Darkchat" und finden Sie weitere Hinweise über die Hintergründe heraus.', //
        'Die Gruppe scheint ein eigenes Verschwörungsnarrativ entwickelt zu haben. Wir müssen herausfinden, ob da mehr dahinter steckt, als nur eine von diesen verschwurbelten Geschichten. Auf wen oder was sollten wir unsere weiteren Recherchen konzentrieren?', //
        'Dafür benötigen wir noch mehr personelle Ressourcen, aber durch Ihre Unterstützung, können wir unsere Kräfte bündeln und fokussieren! Da scheint mehr dahinter zu stecken, als nur ein mögliches Attentat eines Einzeltäters!', //
        'Wir werden unsere Spezialisten für social Media auf die Zielperson ansetzen. Die Hinweise verdichten sich, dass mehr dahinter steckt, als nur ein mögliches Attentat eines Einzeltäters!', //
        'Wir scheinen wirklich einer größeren Sache auf der Spur zu sein, benötigen aber noch mehr Beweise. Zur besseren Schärfung unserer Ermittlungen brauchen wir noch mehr Anhaltspunkte. Kommen Ihnen Hinweise besonders verdächtig vor, denen wir nachgehen sollten?', //
        'Sehr gut, wir werden unser Ermittlerteam entsprechende Anweisungen geben.', //
        'Wir sind einer Angelegenheit von nationaler Tragweite auf der Spur! Doch JETZT benötigen wir DRINGEND das Zielgebiet! Die Zeit läuft uns davon!', //
        'Sobald Sie den Ort wissen, tippen Sie ihn über diesen Chat ins Eingabefeld (Zielgebiet) ein.', //
        scoreText, // must always be the last one.
    ];

const yourMessages =
    [
        'Alles klar!', //
        'Sie können sich auf uns verlassen.', //
        'Es handelt sich um die Tat eines Einzelnen.', //
        'Anscheinend stecken da noch mehre Personen dahinter.', //
        'Entschuldigung, das wird nicht wieder vorkommen.', //
        'Z', //
        'Jonas', //
        'Zoey', //
        'Sarah Sand', //
        'Uns liegen diesbezüglich keine Erkenntnisse vor.', //
        'Sie vertreibt das Medikament.', //
        'Sie hat dieses Medikament entwickelt.', //
        'Sie ist Influencerin und bewirbt das Produkt.', //
        'Das Medikament steht mit dieser Person in keiner Verbindung.', //
        'BFC - Better Fly Corporation', //
        'sand pharmaceuticals', //
        'Café Sommerfreude', //
        'Ok!', //
        'Wir kümmern uns darum!', //
        'Keine, am besten sollten wir die komplette Gruppe hochgehen lassen!', //
        'Nero', //
        'drunkenboy', //
        'snoopy257', //
        'meli_22', //
        'Z', //
        'Ach ja, stimmt! Ok, wir beeilen uns und arbeiten weiter unter Hochdruck!', //
        'Verstanden! Wir können Ihnen in Kürze den Einsatzort durchgeben!', //
        'Hervorragend! Diese Datei hat uns in der Tat noch gefehlt!', //
        'Die Kündigung durch seinen letzten Arbeitgeber.', //
        'Die Ausgrenzung durch seine Kolleg*innen', //
        'Seine unerklärlichen körperlichen Beschwerden und sein Gesundheitszustand', //
        'der Zuspruch in der Gruppe "Darkchat"', //SUPERCHAT REPLACED
        'seine Überzeugung, etwas Gutes für sich und die Gesellschaft zu tun', //
        'der derzeitige Stand der Ermittlungen lässt keine eindeutigen Schlüsse über seine Motive zu.', //
        'die deutsche Heißluftballonmeisterschaft', //
        'Management der better fly corporation', //
        'Management von sand pharmaceuticals', //
        'Influencer cicero', //
        'Influencerin T S Mauf', //
        'Z alias Jonas', //
        'Qurazsand', //
        'Zerum forte', //
        'Ballonseidenhersteller', //
        'lahmgelegte social Media', //
        'statistisches Datenmaterial zu Kopfschmerzen und Konzentrationsschwäche', //
        'Baby Boomer', //
        'Generation Z', //
    ];

/* const droggelbecher = "Bayreuth"; */

/* un-hides animation and calls show message after delay. */
function newPoliceMessage(msgID, delayOverride = 1000) {
    setTimeout(() => {
        $("#typing").removeClass("hidden");
        $("#chat-verlauf").scrollTop($("#chat-verlauf")[0].scrollHeight);
        setTimeout(showMessage, msgAnimDelay, msgID, true);
    }, delayOverride);
}

/* hides animation, plays sound, adds message from array, using the wrapper variables*/
function showMessage(msgID = -1, bPolice = false, bPlaySound = true) {
    var msg = "";
    if (bPolice) {
        $("#typing").addClass("hidden");
        if (bPlaySound) $("#sfx-notify")[0].play();
        $("#typing").before(msgTheyHead + policeMessages[msgID] + msgEnd);

        msg = "[LEITUNG]: " + policeMessages[msgID];

    } else {
        if (bPlaySound) $("#sfx-sent")[0].play();
        $("#typing").before(msgYouHead + yourMessages[msgID] + msgEnd);

        msg = "[GRUPPE]: " + yourMessages[msgID];
    }
    // Share with Controller
    console.log("sendMessage", msg)

    socket.emit('policeLog', msg);
    //scroll down to newest message
    scrollToLatest();
}

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
/* 
//Score functions (add points, show/hide notification)
function scorePoints(points){
    if (bEnableScore) {
        playerScore+= points;
        $("#score-text").text("+ " + points.toString() +" Punkte!");
        scoreText = "Eure Punktezahl für Hintergrundwissen ist: " + playerScore.toString() + " von 100.";
        policeMessages[policeMessages.length-1] = scoreText;
        setTimeout(showScoreNotify(),500);
    }
}

function showScoreNotify(){
    if (bEnableScore && bShowScoreNotify) {
        $("#score-notify").removeClass("hidden");
        var choiceHeight = $("#chat-choices").outerHeight(true);
        var windowHeight = $(window).height();
        var topOffset = windowHeight-choiceHeight-40;
        $("#score-notify").css("bottom", choiceHeight+20);
        setTimeout(hideScoreNotify, 2200);
    }
}

function hideScoreNotify(){
    $("#score-notify").addClass("hidden");
} */

/* Button Show/Hide functions */
function showButtons(btn_id, delayOverride = 3100) {
    setTimeout(() => {
        $(btn_id).removeClass("hidden");
        updateLayout();
        scrollToLatest();
    }, delayOverride);
}

function hideButtons(btn_id) {
    $(btn_id).addClass("hidden");
    updateLayout();
    scrollToLatest();
}

/* ******************************************************************** */
/* Button Click Responses */
//q0
function clicked0_1() {
    //show player message, hide Buttons.
    showMessage(0);
    hideButtons("#q0");
    //Show immediate response.
    newPoliceMessage(2);
    showButtons("#q1");
}
//q1
function clicked1_1() {
    showMessage(1);
    hideButtons("#q1");
    //show next section after pause.
    setTimeout(() => {
        newPoliceMessage(3);
        showButtons("#q2");
    }, msgPause[0]);
}
//q2
function clicked2_1() {
    showMessage(2);
    hideButtons("#q2");
    newPoliceMessage(4);
    setTimeout(() => {
        newPoliceMessage(6);
        showButtons("#q3");
    }, msgPause[1]);
}
function clicked2_2() {
    showMessage(3);
    hideButtons("#q2");
    newPoliceMessage(5);
    setTimeout(() => {
        newPoliceMessage(7);
        showButtons("#q4");
    }, msgPause[2]);
}
//q3
function clicked3_1() {
    showMessage(4);
    hideButtons("#q3");
    setTimeout(() => {
        newPoliceMessage(7);
        showButtons("#q4");
    }, msgPause[3]);
}
//q4
function clicked4_1() {
    showMessage(5);
    hideButtons("#q4");
    newPoliceMessage(9);
    setTimeout(() => {
        newPoliceMessage(12);
        showButtons("#q5");
    }, msgPause[4]);
}
function clicked4_2() {
    showMessage(6);
    hideButtons("#q4");
    newPoliceMessage(9);
    setTimeout(() => {
        newPoliceMessage(12);
        showButtons("#q5");
    }, msgPause[4]);
}
function clicked4_3() {
    showMessage(7);
    hideButtons("#q4");
    newPoliceMessage(10);
    setTimeout(() => {
        newPoliceMessage(12);
        showButtons("#q5");
    }, msgPause[4]);
}
function clicked4_4() {
    showMessage(8);
    hideButtons("#q4");
    newPoliceMessage(11);
    setTimeout(() => {
        newPoliceMessage(12);
        showButtons("#q5");
    }, msgPause[4]);
}
function clicked4_5() {
    showMessage(9);
    newPoliceMessage(8);
}
//q5
function clicked5_1() {
    showMessage(10);
    hideButtons("#q5");
    newPoliceMessage(13);
    setTimeout(() => {
        newPoliceMessage(15);
        showButtons("#q6");
    }, msgPause[5]);
}
function clicked5_2() {
    showMessage(11);
    hideButtons("#q5");
    newPoliceMessage(13);
    setTimeout(() => {
        newPoliceMessage(15);
        showButtons("#q6");
    }, msgPause[5]);
}
function clicked5_3() {
    showMessage(12);
    hideButtons("#q5");
    newPoliceMessage(13);
    setTimeout(() => {
        newPoliceMessage(15);
        showButtons("#q6");
    }, msgPause[5]);
}
function clicked5_4() {
    showMessage(13);
    hideButtons("#q5");
    newPoliceMessage(14);
    setTimeout(() => {
        newPoliceMessage(15);
        showButtons("#q6");
    }, msgPause[5]);
}
//q6
function clicked6_1() {
    showMessage(14);
    hideButtons("#q6");
    newPoliceMessage(16);
    showButtons("#q7");
}
function clicked6_2() {
    showMessage(15);
    hideButtons("#q6");
    newPoliceMessage(17);
    showButtons("#q7");
}
function clicked6_3() {
    showMessage(16);
    hideButtons("#q6");
    newPoliceMessage(18);
    showButtons("#q7");
}
//q7
function clicked7_1() {
    showMessage(17);
    hideButtons("#q7");
    setTimeout(() => {
        newPoliceMessage(19);
        newPoliceMessage(20, 1500);
        showButtons("#q8", 3600);
    }, msgPause[6]);
}
//q8
function clicked8_1() {
    showMessage(18);
    hideButtons("#q8");
    newPoliceMessage(21);
    showButtons("#q9");
}
//q9
function clicked9_1() {
    showMessage(19);
    hideButtons("#q9");
    newPoliceMessage(22);
    showButtons("#q11");
}
function clicked9_2() {
    showMessage(20);
    hideButtons("#q9");
    newPoliceMessage(23);
    showButtons("#q10");
}
function clicked9_3() {
    showMessage(21);
    hideButtons("#q9");
    newPoliceMessage(24);
    showButtons("#q11");
}
function clicked9_4() {
    showMessage(22);
    hideButtons("#q9");
    newPoliceMessage(24);
    showButtons("#q11");
}
function clicked9_5() {
    showMessage(23);
    hideButtons("#q9");
    newPoliceMessage(24);
    showButtons("#q11");
}
function clicked9_6() {
    showMessage(24);
    hideButtons("#q9");
    newPoliceMessage(25);
    showButtons("#q11");
}
// Morse Code wird jetzt geskippt.
/* //q10
function clicked10_1() {
    showMessage(25);
    hideButtons("#q10");
    setTimeout(() => {
        newPoliceMessage(26);
        setTimeout(showMessage, 3900, 27, true);
        showButtons("#q12", 4000);
    }, msgPause[7]);
}
//q11
function clicked11_1() {
    showMessage(26);
    hideButtons("#q11");
    setTimeout(() => {
        newPoliceMessage(26);
        setTimeout(showMessage, 3900, 27, true);
        showButtons("#q12", 4000);
    }, msgPause[7]);
} */


//q10
function clicked10_1() {
    showMessage(25);
    hideButtons("#q10");
    setTimeout(() => {
        newPoliceMessage(28);
        showButtons("#q13");
    }, msgPause[7]);
}
//q11
function clicked11_1() {
    showMessage(26);
    hideButtons("#q11");
    setTimeout(() => {
        newPoliceMessage(28);
        showButtons("#q13");
    }, msgPause[7]);
}

// Morse Code Response Skipped.
//q12
/* function clicked12_1() {
    showMessage(27);
    hideButtons("#q12");
    setTimeout(() => {
        newPoliceMessage(28);
        showButtons("#q13");
    }, msgPause[8]);
} */

//q13
function clicked13_1() {
    showMessage(28);
    hideButtons("#q13");
    newPoliceMessage(29);
    setTimeout(() => {
        newPoliceMessage(34);
        newPoliceMessage(35, 4000);
        showButtons("#q14", 6100);
    }, msgPause[9]);
}
function clicked13_2() {
    showMessage(29);
    hideButtons("#q13");
    newPoliceMessage(29);
    setTimeout(() => {
        newPoliceMessage(34);
        newPoliceMessage(35, 4000);
        showButtons("#q14", 6100);
    }, msgPause[9]);
}
function clicked13_3() {
    showMessage(30);
    hideButtons("#q13");
    newPoliceMessage(30);
    setTimeout(() => {
        newPoliceMessage(34);
        newPoliceMessage(35, 4000);
        showButtons("#q14", 6100);
    }, msgPause[9]);
}
function clicked13_4() {
    showMessage(31);
    hideButtons("#q13");
    newPoliceMessage(31);
    newPoliceMessage(35, 4000);
    showButtons("#q14", 6100);
}
function clicked13_5() {
    showMessage(32);
    hideButtons("#q13");
    newPoliceMessage(32);
    newPoliceMessage(35, 4000);
    showButtons("#q14", 6100);
}
function clicked13_6() {
    showMessage(33);
    hideButtons("#q13");
    newPoliceMessage(33);
    newPoliceMessage(35, 4000);
    showButtons("#q14", 6100);
}
//q14
function clicked14_1() {
    showMessage(34);
    hideButtons("#q14");
    newPoliceMessage(36);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
function clicked14_2() {
    showMessage(35);
    hideButtons("#q14");
    newPoliceMessage(36);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
function clicked14_3() {
    showMessage(36);
    hideButtons("#q14");
    newPoliceMessage(36);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
function clicked14_4() {
    showMessage(37);
    hideButtons("#q14");
    newPoliceMessage(37);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
function clicked14_5() {
    showMessage(38);
    hideButtons("#q14");
    newPoliceMessage(37);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
function clicked14_6() {
    showMessage(39);
    hideButtons("#q14");
    newPoliceMessage(37);
    setTimeout(() => {
        newPoliceMessage(38);
        showButtons("#q15");
    }, msgPause[10]);
}
//q15
function clicked15_1() {
    showMessage(40);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_2() {
    showMessage(41);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_3() {
    showMessage(42);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_4() {
    showMessage(43);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_5() {
    showMessage(44);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_6() {
    showMessage(45);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
}
function clicked15_7() {
    showMessage(46);
    hideButtons("#q15");
    newPoliceMessage(39);
    setTimeout(() => {
        newPoliceMessage(40);
        newPoliceMessage(41, 3000);
    }, msgPause[11]);
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
