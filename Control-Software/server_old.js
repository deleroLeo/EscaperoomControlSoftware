const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
// custom modules in utils folder
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { pingTimeout: 600000 });

const botName = 'Server';



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

// morse status functions
var morseMap = new Map();
function getMorseStatus(room) {
    if (!morseMap.has(room)) {
        return false;
    }
    return morseMap.get(room);
}

function updateMorseStatus(room, newStatus) {
    morseMap.set(room, newStatus);
}

// cam status functions
var camMap = new Map();
function getCamStatus(room) {
    if (!camMap.has(room)) {
        return false;
    }
    return camMap.get(room);
}

function updateCamStatus(room, newStatus) {
    camMap.set(room, newStatus);
}

app.use(express.json());

// POST requests for morse
//get morse status
app.post('/api/get-morse/:roomname', (req, res) => {
    let { roomname } = req.params;
    let status = getMorseStatus(roomname);
    res.send({
        morseStatus: status,
    });
});
//set morse status
app.post('/api/set-morse/:roomname', (req, res) => {
    let { roomname } = req.params;
    updateMorseStatus(roomname, false)
    res.send({
        morseStatus: `Updated morse status of ${roomname} to false.`,
    });
    console.log("test")
});


// POST requests for cam
//get cam status
app.post('/api/get-cam/:roomname', (req, res) => {
    let { roomname } = req.params;
    let status = getCamStatus(roomname);
    res.send({
        camStatus: status,
    });
});
//set cam status
app.post('/api/set-cam/:roomname', (req, res) => {
    let { roomname } = req.params;
    updateCamStatus(roomname, false)
    res.send({
        camStatus: `Updated cam status of ${roomname} to false.`,
    });
    console.log("cam-changed");
});


app.post('http://127.0.0.1:2142/Controller/save-settings', (req, res) => {
    try {
        // Get settings from request
        const settings = req.body;
        
        // Validate settings
        if (!settings || typeof settings !== 'object') {
            return res.status(400).send('Invalid settings data');
        }
        
        // Save to file
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        // Log success
        console.log('Settings saved:', settings);
        
        res.status(200).send('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).send('Error saving settings');
    }
});

// Endpoint to get settings
app.get('http://127.0.0.1:2142/Controller/get-settings', (req, res) => {
    try {
        // Check if settings file exists
        if (fs.existsSync(SETTINGS_FILE)) {
            const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));
            res.json(settings);
        } else {
            res.json({ message: 'No settings found' });
        }
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).send('Error reading settings');
    }
});


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

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
        socket.emit('server-log', formatMessage(botName, `Willkommen zum Raum ${user.room}!`));
        if (user.username === "Controller") {
            socket.emit('server-log', formatMessage(botName, `Starten Sie den Countdown sobald die Gruppe den Polizeichat geöffnet hat. Der Countdown ist nur ein Anhaltspunkt und hat keinen Effekt auf den Spielverlauf.`));
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
                io.to(user.room).emit('server-log', formatMessage(botName, `Darkchat Status geupdated. Neuer Status: ${newStatus}`));
            } else {
                io.to(user.room).emit('server-log', formatMessage(botName, 'Error status does not match input requirements'));
            }
        }
    });

    // Listen for Controller inputs for Cam and Morse Status
    socket.on('send-morse', () => {
        const user = getCurrentUser(socket.id);
        if (user) {
            updateMorseStatus(user.room, true);
            io.to(user.room).emit('server-log', formatMessage(botName, `Morse E-Mail wird verschickt!`));
        }
    });
    socket.on('send-cam', () => {
        const user = getCurrentUser(socket.id);
        if (user) {
            updateCamStatus(user.room, true);
            io.to(user.room).emit('server-log', formatMessage(botName, `SpyCam E-Mail wird verschickt!`));
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
    socket.on('chatLog', msg => {
        const user = getCurrentUser(socket.id);
        if (user) {
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


const PORT = 2142 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));