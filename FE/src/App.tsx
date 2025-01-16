import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>(["hii"]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onmessage = (msg) => {
      setMessages([...messages, msg.data]);
    };
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "123",
          },
        })
      );
    };
  }, [messages]);

  const handleClick = () => {
    if (wsRef.current && inputRef.current?.value) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message: inputRef.current.value,
          },
        })
      );
      inputRef.current.value = "";
    }
  };

  return (
    <div className="h-screen bg-[#292929] flex flex-col justify-between   ">
      <div className="m-4">
        {messages?.map((msg, ind) => (
          <div
            key={ind}
            className="text-white text-lg border border-purple-500 w-fit px-4 py-1 rounded-lg shadow-inner shadow-purple-700 mb-3 "
          >
            {msg}
          </div>
        ))}
      </div>
      <div className="flex mb-4">
        <input
          ref={inputRef}
          className="w-full ml-4 p-2 rounded-md  "
          type="text"
          placeholder="Enter message"
        />
        <button
          className="w-fit text-white py-2 px-4 bg-purple-500 rounded-md mx-4 "
          onClick={handleClick}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
