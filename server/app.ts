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
let winner = "";
let state = Array(9).fill(null);
var aWss = expressWsInstance.getWss();


function broadcast(data: Record<string, any>) {
  aWss.clients.forEach(function (client, idx) {
    console.log(idx)
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


  ws.on('message', function (message) {
    const msg = message.toString();
    if (currentPlayer == "") {
      ws.send('{"error": "Game is not full"}');
      return;
    }
    let data = {};
    if (msg == 'Start') {
      data = { user: userid, state: state, next: currentPlayer }
      broadcast(data);
      return;
    }
    if (msg == 'Reset' && winner.length > 0) {
      id = 0;
      state = Array(9).fill(null);
      winner = "";
      broadcast({ user: userid, state: state, next: "X" });
      currentPlayer = "X";
      return;

    }
    if (userid != currentPlayer) {
      const data = { user: userid, state: state, error: "Not your turn", next: currentPlayer }
      ws.send(JSON.stringify(data));
      return;
    }
    if (state[parseInt(msg as unknown as string)] != null) {
      const data = { user: userid, state: state, error: "Cell is already filled", next: currentPlayer }
      ws.send(JSON.stringify(data));
      return;
    }
    if (winner.length > 0) {
      const data = { user: userid, state: state, error: "Game is over", winner: winner, next: currentPlayer }
      ws.send(JSON.stringify(data));
      return;
    }

    state[parseInt(msg as unknown as string)] = userid;
    currentPlayer = userid == "X" ? "O" : "X";
    const calculatedWinner = calculateWinner(state);
    if (calculatedWinner != null) {
      data = { user: userid, state: state, winner: calculatedWinner }
      winner = calculatedWinner;
      broadcast(data);
      return;
    }
    data = { user: userid, state: state, next: currentPlayer }
    broadcast(data);
  });

  ws.on('close', function () {
    id = 0;
    state = Array(9).fill(null);
    broadcast({ error: "One person has quit the game!" });
    aWss.clients.forEach(client => client.close());
    currentPlayer = "";
  });
  console.log('socket', userid);
});

