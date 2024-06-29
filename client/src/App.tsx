import { useCallback, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Board from "./Components/Board";

export default function Game() {
  // function handlePlay(nextSquares) {
  //   setCurrentMove(nextHistory.length - 1);
  // }

  const [socketUrl, setSocketUrl] = useState("ws://localhost:3000");

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const startGame = useCallback(() => {
    sendMessage("Start"), setIsGameStarted(true);
  }, []);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const currentState = JSON.parse(lastMessage?.data || "{}");
  return (
    <div className="game">
      {!currentState?.["state"] && (
        <button onClick={startGame}>Start Game</button>
      )}
      <div className="game-board">
        {currentState?.["state"] && (
          <Board
            isWinner={currentState["winner"]}
            xIsNext={currentState["next"] === "X"}
            squares={currentState["state"]}
            onPlay={(val) => {
              sendMessage(val.toString());
            }}
          />
        )}
      </div>
    </div>
  );
}
