import express from "express";
import expressWs from "express-ws";
import { calculateWinner } from "./utils";
const expressWsInstance = expressWs(express())
const app = expressWsInstance.app;
const port = 3000


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

var id = 0;

let currentPlayer = "";
let state = Array(9).fill(null);
var aWss = expressWsInstance.getWss();


function broadcast(data: Record<string, any>) {
  aWss.clients.forEach(function (client) {
    client.send(JSON.stringify(data));
  });
}

app.ws('/', function (ws, req) {
  if (id > 1) {
    ws.send('{"error": "Game is full"}');
    ws.close();
    return;
  }
  const userid = id == 0 ? "X" : "O";
  if (id == 0) {
    currentPlayer = userid;
  }
  id++;


  ws.on('message', function (msg) {
    let data = {};
    if (msg == 'Start') {
      data = { user: userid, state: state, next: currentPlayer }
      broadcast(data);
      return;
    }
    if (userid != currentPlayer) {
      const data = { user: userid, state: state, error: "Not your turn", next: currentPlayer }
      ws.send(JSON.stringify(data));
      return;
    }
    state[parseInt(msg as unknown as string)] = userid;
    currentPlayer = userid == "X" ? "O" : "X";
    if (calculateWinner(state)) {
      data = { user: userid, state: state, winner: calculateWinner(state) }
      broadcast(data);
      aWss.clients.forEach(client => client.close());
      return;
    }
    data = { user: userid, state: state, next: currentPlayer }
    broadcast(data);
  });

  ws.on('close', function () {
    id = 0;
    state = Array(9).fill(null);
    broadcast({ user: "", state: state, next: "" });
    currentPlayer = "";
  });
  console.log('socket', userid);
});

