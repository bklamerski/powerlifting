const express = require('express')
const app = express()
const path = require('path')
const expressWs = require('express-ws')(app);

const PORT = process.env.PORT || 3000;

const rooms = new Map();

function createRoom(roomData) {
    const room = rooms.get(roomData.name);
    if(room) {
        if(roomData.password === room.password) {
            return { type: 'createResult', data: 'room already exists' };
        }
        return { type: 'createResult', data: 'incorrect password' };
    }
    rooms.set(roomData.name, roomData);
    return { type: 'createResult', data: { result: 'room created', name: roomData.name} };
}

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/public/index.html'))
})

app.ws('/', function(ws, req){
    ws.on('message', function(msg){
        const msgJson = JSON.parse(msg)
        console.log(msgJson);
        if(msgJson.type === 'create') {
            ws.send(JSON.stringify(createRoom(msgJson.data)));
        }
    });
});

app.listen(PORT)

console.log("start")