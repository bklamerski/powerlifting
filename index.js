const express = require('express')
const app = express()
const path = require('path')
const expressWs = require('express-ws')(app);

const PORT = process.env.PORT || 3000;

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/public/index.html'))
})

app.ws('/', function(ws, req){
    ws.on('message', function(msg){
        console.log(msg);
    });
});

app.listen(PORT)

console.log("start")