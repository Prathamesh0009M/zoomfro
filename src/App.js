import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import Room from './components/Room';
import Lobby from './components/Lobby';
import logo from "./components/logo.png"
import Navbar from './components/Navbar';
function App() {
  return (
    <div className='bg-black'>
      <Navbar />


      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/room/make-meet`} replace />}
        />
        {/* <Route 
          path="/" 
          element={<Navigate to={`/room-/${uuidV4()}`} replace />} 
        /> */}
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/room/make-meet" element={<Lobby />} />

      </Routes>
    </div>
  );
}

export default App;