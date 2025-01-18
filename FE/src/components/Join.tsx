import { useRef, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useCopyToClipboard } from "usehooks-ts";

const Join = ({ setWs, setId }: any) => {
  const [clicked, setClicked] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const [copiedId, copy] = useCopyToClipboard();
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const inputNameRef = useRef<HTMLInputElement | null>(null);
  const inputRoomRef = useRef<HTMLInputElement | null>(null);
  //   const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const handleJoin = () => {
    const wss = new WebSocket("ws://localhost:8080");

    // Extract input values
    const name = inputNameRef.current?.value.trim();
    const roomId = inputRoomRef.current?.value.trim();

    // Validate inputs
    if (!name || !roomId) {
      alert("Both name and room ID are required!");
      return;
    }

    wss.onopen = () => {
      //   console.log("WebSocket Opened", name, roomId);
      wss.send(
        JSON.stringify({
          type: "join",
          payload: {
            name,
            roomId,
          },
        })
      );
      localStorage.setItem("loggedIn", "true");
      navigate("/home");
    };

    // Clear inputs and close modal (optional)
    if (inputNameRef.current) inputNameRef.current.value = "";
    if (inputRoomRef.current) inputRoomRef.current.value = "";
    setClicked(false);

    // Save WebSocket instance
    setWs(wss);
  };

  const handleCreateID = async () => {
    const response = await fetch("http://localhost:8080/create-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    setRoomId(data.roomId);
    setId(data.roomId);
    setClicked(true);
  };

  const handleCopy = (id: string) => {
    copy(id)
      .then(() => {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2000);
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-[#1E1B29]">
      <div className="relative w-[30vw] bg-[#2A2739] p-6 rounded-md shadow-md">
        {clicked && (
          <div className="flex items-center justify-between mb-4 p-2 border border-[#444] rounded-md bg-[#1E1B29]">
            <span className="text-sm text-white truncate max-w-[200px]">
              {roomId}
            </span>
            <div className="flex items-center space-x-4">
              <button onClick={() => handleCopy(roomId)}>
                <FaCopy className="text-white" />
              </button>
              <IoMdClose
                className="text-white cursor-pointer"
                onClick={() => setClicked(false)}
              />
            </div>
          </div>
        )}

        {copiedMsg && (
          <div className="absolute top-[-3vh] right-[-7vw] bg-pink-500 text-white px-4 py-2 rounded-md shadow-md">
            Copied to clipboard
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <input
            ref={inputNameRef}
            type="text"
            placeholder="Enter your name"
            className="w-full p-3 text-sm rounded-md border border-[#444] bg-[#1E1B29] text-white placeholder:text-[#888] focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <input
            ref={inputRoomRef}
            type="text"
            placeholder="Enter room ID"
            className="w-full p-3 text-sm rounded-md border border-[#444] bg-[#1E1B29] text-white placeholder:text-[#888] focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <button
            onClick={handleJoin}
            className="w-full mb-3 py-2 text-md font-semibold text-[#1E1B29] bg-pink-500 rounded-md hover:bg-pink-600 transition"
          >
            Join
          </button>
          <div className="relative flex items-center py-4 justify-center text-white">
            <span className="absolute bg-[#1E1B29] rounded-lg py-1 px-4 text-md font-medium ">
              OR
            </span>
            <hr className="w-full border-[#444]" />
          </div>
          <button
            onClick={handleCreateID}
            className="w-full py-2 text-md font-semibold text-[#1E1B29] bg-pink-500 rounded-md hover:bg-pink-600 transition"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Join;
