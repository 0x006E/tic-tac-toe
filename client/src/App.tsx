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
  const [counter, setCounter] = useState(0);
  const [user, setUser] = useState("");
  const { sendMessage, lastJsonMessage, readyState } = useWebSocket<Message>(
    "ws://localhost:3000"
  );
  const startGame = useCallback(() => {
    sendMessage("Start");
  }, []);

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
                isWinner={currentState["winner"]}
                xIsNext={currentState["next"] === "X"}
                squares={currentState["state"]}
                onPlay={(val) => {
                  sendMessage(val.toString());
                }}
              />
              {currentState?.["winner"] && (
                <button onClick={() => sendMessage("Reset")}>Reset</button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
