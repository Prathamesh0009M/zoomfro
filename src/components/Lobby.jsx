import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";

const Lobby = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    } else {
      alert("Please enter a valid room ID.");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link Copied !");
  };

  return (
    <div className="lobby-container bg-richblack-800 flex flex-col items-center justify-center h-screen px-4">
        <p className="title text-white text-xl md:text-2xl font-bold text-center mb-6">
        Welcome to the Meeting Lobby
      </p>

      <p className="subtitle text-white text-lg md:text-xl text-center mb-6">
        Create or join a room to start a meeting
      </p>

      <div className="action-buttons mb-6">
        <button className="create-room-button" onClick={handleCreateRoom}>
          Create Room
        </button>
      </div>

      <div className="join-room-container mb-6 flex items-center gap-4">
        <input
          type="text"
          className="room-input text-blue-950 p-2 border-2 border-gray-300 rounded-md text-sm md:text-lg"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="join-room-button" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>

      {roomId && (
        <div className="share-link-container mt-6 text-center">
          <p className="share-text text-white text-lg mb-4">
            Share this link to invite others:
          </p>
          <div className="share-link bg-gray-700 p-4 rounded-md flex items-center justify-center gap-4">
            <span className="text-blue-100">{`${window.location.origin}/room/${roomId}`}</span>
            <button className="copy-link-button p-2 bg-blue-500 rounded-md text-white" onClick={handleCopyLink}>
              Copy Link
            </button>
          </div>
        </div>
      )}

      <style>{`
        .lobby-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
        }

        .title {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 1.2rem;
          margin-bottom: 20px;
        }

        .action-buttons {
          margin-bottom: 20px;
        }

        .create-room-button,
        .join-room-button,
        .copy-link-button {
          background: #61dafb;
          color: black;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
        }

        .create-room-button:hover,
        .join-room-button:hover,
        .copy-link-button:hover {
          background: #21a1f1;
        }

        .join-room-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .room-input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
        }

        .share-link-container {
          margin-top: 20px;
          text-align: center;
        }

        .share-text {
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .share-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #3a3f47;
          padding: 10px;
          border-radius: 5px;
        }

        .share-link span {
          color: #61dafb;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};

export default Lobby;
