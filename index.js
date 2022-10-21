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
    rooms.set(roomData.name, {...roomData, refereePositions: []});
    return { type: 'createResult', data: { result: 'room created', name: roomData.name} };
}

function refereeJoin(data) {
    const room = rooms.get(data.name);
    if(room) {
        if(data.password === room.password) {
            if(room.refereePositions.includes(data.refereePosition)) {
                return { type: 'joinResult', data: 'pozycja już zajęta'}
            } else {
                room.refereePositions.push(data.refereePosition);
                return { type: 'joinResult', data: data.refereePosition};
            }
        } else {
            return { type: 'joinResult', data:'nieprawidłowe hasło'};
        }
    }
    return {type: 'joinResult', data:'Zawody nie istnieją'}
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
        } else if(msgJson.type === 'ref join') {
            ws.send(JSON.stringify(refereeJoin(msgJson.data)));
        }
    });
});

app.listen(PORT)

console.log("start")