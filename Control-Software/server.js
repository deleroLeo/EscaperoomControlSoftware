import path from "path";
import { createServer } from 'http';
import express from "express";
import client from "prom-client";

import { Server } from 'socket.io';
import logger from "./logging.js";
import fs from "fs";

import {spawn} from 'child_process'

import formatMessage from "./utils/messages.js"

import {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} from './utils/users.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);//socketio(server, { pingTimeout: 600000 });

const botName = 'Server';

const SETTINGS_FILE = path.join(/*__dirname, */"settings" ,'settings');

const register = new client.Registry();

client.collectDefaultMetrics({
  register: register,
});


//To do: Struktur soweit verstehen, dass nicht nur für jeden Raum bei Z-Immun ein unterschiedlicher User angelegt wird, 
//sondern dass für jeden Escaperoom (zumindest mal Labor und Z-Immun) ein Chatraum angelegt wird. 

//TO do 2: lokales Konzept macht das mit den unterschiedlichen Räumen unwichtig. Das ersetzen durch unterschiedliche Escaperäume 
//==> Z-Immun Landing-Page kann abgeschafft werden.


// Map with all the game rooms' status variables.
var statusMap = new Map();

// Checks if the room exists, if not a new entry is created with default 1, then returns the room's status.
function getCurrentStatus(room) {
    if (!statusMap.has(room)) {
        statusMap.set(room, 1);
    }
    return statusMap.get(room);
} 


function updateStatus(room, newStatus) {
    statusMap.set(room, newStatus);
}


function import_settings(room) {
    if (fs.existsSync(SETTINGS_FILE+room+".json")) {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE+room+".json"));
    //Problem!!!!!!!!!!!!!!
    // Look for something like settings.values that outputs alle he values in order in a List without needing the keys
       var values = Object.keys(settings).map(function(key){
            return settings[key];
        });
        return values; 
    } else {
        logger.error("no settings found...");
    }
    
}

// morse status functions
var morseMap = new Map();
/*function getMorseStatus(room) {
    if (!morseMap.has(room)) {
        return false;
    }
    return morseMap.get(room);
}*/

function updateMorseStatus(room, newStatus) {
    morseMap.set(room, newStatus);
}

// cam status functions
var camMap = new Map();
/*function getCamStatus(room) {
    if (!camMap.has(room)) {
        return false;
    }
    return camMap.get(room);
}*/

function updateCamStatus(room, newStatus) {
    camMap.set(room, newStatus);
}

function updateCamSettings(room, ip, channel) {
    const username = "admin"
    const password = "EXITmobil"
    logger.info("CameraIp: ",ip)
    fetch(`http://192.168.6.2:8083/stream/${room}/channel/${channel}/edit`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({name: "ch1",
            url: `${ip}`,
            on_demand: true,
            audio: true,
            debug: false,
            status: 0
            }),
    headers: {
        'Authorization': `Basic `+ Buffer.from(`${username}:${password}`).toString("base64"),
        "Content-type": "application/json"  
    }
    })
    //.then((response) => response.json())
    .then(async res => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fehler: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
})
.then(data => {
  logger.info('Antwort:', data);
})
.catch(err => {
  logger.error('Request fehlgeschlagen:', err.message);
});

}


app.use(express.json());







// Set static folder
app.use(express.static(path.join(__dirname, 'public')));



app.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});


/* 
 * On connection join a room, send welcome messages and create event listeners to respond to specific message functions.
 * @'join-room': On establishing a connection, join the user selected room for further communication.
 * @'server-log': Server to Controller -> sends logs to keep track of what's currently happening.
 * @'status': Server to all -> sends everybody the current status. Will come as response to 'update-status'
 * @'update-status': Controller to Server tries to update Status. Server checks content for errors then updates if possible.
*/
io.on('connection', socket => {
    //room specific functions -> when user joins only send these messages in the current room.
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)

        // Join room
        socket.join(user.room);

        // Send a server-log to the controller on connection. Potentially useful for displaying the rules.
        //socket.emit('server-log', formatMessage(botName, `Willkommen zum Raum ${user.room}!`));
        if (user.room =="Z-Immun"){
            if (user.username === "Controller") {
                socket.emit('server-log', formatMessage(botName, `Starten Sie den Countdown sobald die Gruppe den Polizeichat geöffnet hat. Der Countdown ist nur ein Anhaltspunkt und hat keinen Effekt auf den Spielverlauf.`));
            }

            
        }

        // Notifiy the controller via a server-log when a user connects to the room.
        socket.broadcast.to(user.room).emit('server-log', formatMessage(botName, `${user.username} hat den Raum betreten.`));

        // Share the current room's status with the new user.
        io.to(user.room).emit('status', getCurrentStatus(user.room));

        // Send User and Room info.
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for superchat status updates
    socket.on('update-status', (newStatus) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            const parsedStatus = parseInt(newStatus);

            if (!(isNaN(parsedStatus)) && (newStatus < 30)) {
                updateStatus(user.room, newStatus);

                io.to(user.room).emit('status', newStatus);
                io.to(user.room).emit('server-log', formatMessage(botName, `Status geupdated. Neuer Status: ${newStatus}`));
            } else {
                io.to(user.room).emit('server-log', formatMessage(botName, 'Error status does not match input requirements'));
            }
        }
    });


    socket.on('shortActivation', (effect) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit('shortActivation', effect);
        }
    })

    // Listen for Controller inputs for Cam and Morse Status
    socket.on('send-morse', (room) => {
        const user = getCurrentUser(socket.id);
        if (user && room =="Z-Immun") {


            var subject = "Morsecode gehackt";
            var file_path= "10_morsecode.wav";
            var message = "Schaut mal ... dieses Audiofile konnte ich noch aus einem Privatchat abfangen. Eventuell hilft euch das weiter :-)  Grüße Ein Verbündeter";
            const [sender_mail, sender_password, receiver_mail, receiver_password, ip_spycam, ip_gamemastercam ]= import_settings(room);

            logger.info("Settings output",import_settings(room))
            const shellcode = `from controll_Software import send_mail;send_mail("${receiver_mail}", "${sender_mail}", "${sender_password}", "${subject}", r"${message}", file_path = "${file_path}")`


            var process = spawn('python',['-u', '-'], {stdio: ['pipe', 'pipe', 'inherit']});
            process.stdin.write(shellcode);
            process.stdin.end();

            
            process.stdout.on('data', (data) => {
                logger.info('Python output', data.toString());
                io.to(user.room).emit('server-log', formatMessage(botName, data.toString()));
            } );

            updateMorseStatus(user.room, true);
            io.to(user.room).emit('server-log', formatMessage(botName, `Morse E-Mail wird verschickt!`));
        }
    });

    socket.on('send-cam', (room) => {
        const user = getCurrentUser(socket.id);
        if (user && user.room =="Z-Immun") {


            var subject = "Achtung!";
            var message = "Achtung Leute.... diese Bilder hier konnte ich von Privatchats abfangen. Irgendwo bei euch ist ne Spionagecam versteckt... Grüße: Ein Verbündeter";
            const [sender_mail, sender_password, receiver_mail, receiver_password, ip_spycam, ip_gamemastercam ]= import_settings(user.room);
            const shellcode = `from controll_Software import send_mail;send_mail("${receiver_mail}", "${sender_mail}", "${sender_password}", "${subject}", r"${message}",  pic = True, adress = "${ip_spycam}")`


            var process = spawn('python',['-u', '-'], {stdio: ['pipe', 'pipe', 'inherit']});
            process.stdin.write(shellcode);
            process.stdin.end();

            
            process.stdout.on('data', (data) => {
                logger.info('Python output', data.toString());
                io.to(user.room).emit('server-log', formatMessage(botName, data.toString()));
            } );
            updateCamStatus(user.room, true);
            io.to(user.room).emit('server-log', formatMessage(botName, `SpyCam E-Mail wird verschickt!`));
        }
    });

    socket.on('mail-reset', (room) => {
        const user = getCurrentUser(socket.id);
        if (user && user.room =="Z-Immun") {


            const [sender_mail, sender_password, receiver_mail, receiver_password, ip_spycam, ip_gamemastercam ]= import_settings(user.room);
            const shellcode = `from controll_Software import reset;reset("${receiver_mail}", "${sender_mail}", "${receiver_password}","${sender_password}")`


            var process = spawn('python',['-u', '-'], {stdio: ['pipe', 'pipe', 'inherit']});
            process.stdin.write(shellcode);
            process.stdin.end();

            
            process.stdout.on('data', (data) => {
                logger.info('Python output', data.toString());
                io.to(user.room).emit('server-log', formatMessage(botName, data.toString()));
            } );
            
            io.to(user.room).emit('server-log', formatMessage(botName, `Mail-Reset wurde erfolgreich durchgeführt`));
        }
    });

    socket.on('settings-save', ({room, settings}) =>{
        
        const user = getCurrentUser(socket.id);

        fs.writeFileSync(SETTINGS_FILE+room+".json", JSON.stringify(settings, null, 2));

        const IPs= import_settings(room).slice(-2);
        
        
        let i = 0;
        for (const ip of IPs){
            updateCamSettings(room, ip, i);
            i +=1;
        } 

        
        // Log success
        
       

    });

    socket.on('settings-load', (room) =>{
        if (fs.existsSync(SETTINGS_FILE+room+".json")) {
            const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE+room+".json"));
            const user = getCurrentUser(socket.id);
            if (user) {
                io.to(user.room).emit('settingLog', formatMessage(user.username, settings));
        }
        } else {
            logger.error("no settings found...");
        }

    });


    // Listen for Chat Messages
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
    });

    // Listen for Polizeichat choices
    socket.on('policeLog', msg => {
        const user = getCurrentUser(socket.id);
        if (user && user.room =="Z-Immun") {
            io.to(user.room).emit('policeLog', formatMessage(user.username, msg));
        }
    });

    // Runs when Client disconnects
    socket.on('disconnect', (reason) => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('server-log', formatMessage(botName, `${user.username} hat den Raum verlassen. Grund: ${reason}`));

            // Update User and Room info.
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

console.log(__dirname)
console.log(SETTINGS_FILE)
const PORT = process.env.PORT  ||2142;
server.listen(PORT,"0.0.0.0", () => logger.info(`Server running on port ${PORT}`));