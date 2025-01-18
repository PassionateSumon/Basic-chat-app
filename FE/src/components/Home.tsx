import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  ws: WebSocket | null;
  id: string;
}

const Home: React.FC<HomeProps> = ({ ws, id }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ws) {
      console.error("WebSocket instance is null.");
      return;
    }

    ws.onmessage = (msg: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, msg.data]);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket Closed");
      navigate("/");
    };
  }, [ws, navigate]);

  const handleClick = () => {
    // let inputValue = inputRef.current?.value;
    if (inputRef.current?.value && ws) {
      ws.send(
        JSON.stringify({
          type: "chat",
          payload: {
            roomId: id,
            message: inputRef.current?.value.trim(),
          },
        })
      );
      inputRef.current.value = "";
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  return (
    <div className="h-screen bg-[#292929] flex flex-col justify-between">
      <div className="m-4">
        {messages.map(
          (msg, ind) =>
            ind > 0 && (
              <div
                key={ind}
                className="text-white text-lg border border-purple-500 w-fit px-4 py-1 rounded-lg shadow-inner shadow-purple-700 mb-3"
              >
                {JSON.parse(msg).message}
              </div>
            )
        )}
      </div>

      <div className="flex mb-4">
        <input
          ref={inputRef}
          className="w-full ml-4 p-2 rounded-md bg-[#1E1B29] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          type="text"
          placeholder="Enter message"
        />
        <button
          className="w-fit text-white py-2 px-4 bg-purple-500 rounded-md mx-4 hover:bg-purple-600 transition"
          onClick={handleClick}
        >
          Send
        </button>
      </div>

      <button
        className="w-fit text-white py-2 px-4 bg-red-500 rounded-md mx-4 hover:bg-red-600 transition"
        onClick={handleLogOut}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
