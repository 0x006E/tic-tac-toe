import { useCallback, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Board from "./Components/Board";

type Message = {
  user: "X" | "O";
  state: Array<string | null>;
  next: "X" | "O";
  error?: string;
  winner?: "X" | "O";
};

export default function Game() {
  // function handlePlay(nextSquares) {
  //   setCurrentMove(nextHistory.length - 1);
  // }

  const [socketUrl, setSocketUrl] = useState("ws://localhost:3000");
  const [user, setUser] = useState("");
  const { sendMessage, lastJsonMessage, readyState } =
    useWebSocket<Message>(socketUrl);
  const startGame = useCallback(() => {
    if (readyState !== ReadyState.OPEN) {
      setSocketUrl("ws://localhost:3000");
    }
  }, [socketUrl]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const currentState = lastJsonMessage;
  return (
    <>
      <div>
        <h1>Tic Tac Toe</h1>
        {connectionStatus}
        {currentState?.["error"] && <div>{currentState["error"]}</div>}
        {!currentState?.["state"] && (
          <button onClick={startGame}>Start Game</button>
        )}
      </div>
      <div className="game">
        <div className="game-board">
          {currentState?.["state"] && (
            <>
              <Board
                user={user}
                isWinner={currentState["winner"]}
                xIsNext={currentState["next"] === "X"}
                squares={currentState["state"]}
                onPlay={(val) => {
                  sendMessage(val.toString());
                }}
              />
              <button onClick={() => sendMessage("Reset")}>Reset</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
