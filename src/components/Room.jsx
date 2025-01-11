import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faPhoneSlash, faLink } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const Room = () => {
  const { roomId } = useParams();

  const videoGridRef = useRef();
  const myVideoRef = useRef();
  const peersRef = useRef({});
  const socketRef = useRef();
  const myStreamRef = useRef();
  const peerRef = useRef();
  const myIdRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [userName, setUserName] = useState(`User ${Math.random().toString(36).substring(2, 8)}`);
  const [isEditingName, setIsEditingName] = useState(false);

  const addVideoStream = (video, stream) => {
    if (!video || !stream) {
      console.error('Missing video element or stream');
      return;
    }
    try {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.error('Error playing video:', err));
      });
    } catch (err) {
      console.error('Error adding video stream:', err);
    }
  };

  const removeExistingVideo = (userId) => {
    const existingContainer = document.getElementById(`video-container-${userId}`);
    if (existingContainer) {
      existingContainer.remove();
    }
    if (peersRef.current[userId]) {
      peersRef.current[userId].call?.close();
      delete peersRef.current[userId];
    }
  };

  const createVideoElement = (userId) => {
    console.log('Creating video element for:', userId);

    const parts = userId.split('-');
    const peerId = parts[parts.length - 1];

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.id = `video-container-${userId}`;

    const label = document.createElement('h3');
    label.className = 'video-label';
    label.textContent = `User ${peerId}`;

    const video = document.createElement('video');
    video.classList.add('remote-video');
    video.id = `video-${userId}`;
    video.autoplay = true;
    video.playsInline = true;

    videoContainer.appendChild(label);
    videoContainer.appendChild(video);

    if (videoGridRef.current) {
      const existingContainer = document.getElementById(`video-container-${userId}`);
      if (existingContainer) {
        existingContainer.remove();
      }
      videoGridRef.current.appendChild(videoContainer);
    }

    return { video, container: videoContainer };
  };

  const handleCall = (call) => {
    console.log('Receiving call from:', call.peer);
    try {
      if (call.peer === peerRef.current.id) {
        console.log('Ignoring call from self');
        return;
      }

      removeExistingVideo(call.peer);

      call.answer(myStreamRef.current);
      const videoElement = createVideoElement(call.peer);

      if (videoElement) {
        const { video, container } = videoElement;

        call.on('stream', (remoteStream) => {
          console.log('Received remote stream in handleCall:', remoteStream.id);
          addVideoStream(video, remoteStream);
        });

        call.on('close', () => {
          console.log('Call closed for:', call.peer);
          removeExistingVideo(call.peer);
        });

        peersRef.current[call.peer] = { call, video, container };
      }
    } catch (err) {
      console.error('Error in handleCall:', err);
    }
  };

  const connectToNewUser = (userId, stream) => {
    console.log('Connecting to new user:', userId);
    try {
      removeExistingVideo(userId);

      const call = peerRef.current.call(userId, stream);
      const { video, container } = createVideoElement(userId);

      call.on('stream', (remoteStream) => {
        console.log('Received remote stream in connectToNewUser:', remoteStream.id);
        addVideoStream(video, remoteStream);
      });

      call.on('close', () => {
        console.log('Call closed for:', userId);
        removeExistingVideo(userId);
      });

      peersRef.current[userId] = { call, video, container };
    } catch (err) {
      console.error('Error in connectToNewUser:', err);
    }
  };

  const toggleAudio = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const handleNameChange = (newName) => {
    setUserName(newName);
    setIsEditingName(false);
    socketRef.current?.emit('name-change', roomId, peerRef.current.id, newName);
  };

  const leaveCall = () => {
    myStreamRef.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.destroy();
    socketRef.current?.disconnect();
    window.location.href = '/';
  };

  useEffect(() => {
    const setupRoom = async () => {
      try {
        Object.keys(peersRef.current).forEach(removeExistingVideo);
        peersRef.current = {};

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        myStreamRef.current = stream;

        if (myVideoRef.current) {
          addVideoStream(myVideoRef.current, stream);
        }

        const randomId = Math.random().toString(36).substring(2, 8);
        const peerId = `${roomId}-${Date.now()}-${randomId}`;

        myIdRef.current = `User ${randomId}`;

        const peer = new Peer(peerId, {
          host: 'localhost',
          port: 5000,
          path: '/peerjs',
          debug: 3,
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('My peer ID:', id);
          const socket = io('http://localhost:5000');
          socketRef.current = socket;

          socket.on('connect', () => {
            socket.emit('join-room', roomId, id);
          });

          socket.on('user-connected', (newUserId) => {
            console.log('User connected:', newUserId);
            if (newUserId !== id) {
              setTimeout(() => connectToNewUser(newUserId, stream), 1000);
            }
          });

          socket.on('user-disconnected', (userId) => {
            console.log('User disconnected:', userId);
            removeExistingVideo(userId);
          });
        });

        peer.on('call', (call) => {
          if (call.peer !== peer.id) {
            handleCall(call);
          }
        });

      } catch (err) {
        console.error('Error setting up room:', err);
      }
    };

    setupRoom();

    return () => {
      console.log('Cleaning up room');
      Object.keys(peersRef.current).forEach(removeExistingVideo);
      peersRef.current = {};
      myStreamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
      socketRef.current?.disconnect();
      if (videoGridRef.current) {
        videoGridRef.current.innerHTML = '';
      }
    };
  }, [roomId]);

  const copyUrlToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Copied to clipboard")
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  return (
  <div className="room-container min-h-screen flex flex-col items-center justify-between bg-richblack-800 text-white pb-4 relative">
  {/* Video Section */}
  <div className="video-section w-full flex flex-col items-center mb-8 space-y-6 sm:space-y-8">
    {/* Remote Videos */}
    <div
      ref={videoGridRef}
      className="video-grid w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4"
    ></div>
  </div>

  {/* Local Video */}
  <div className="local-video-container sticky bottom-20 right-4 flex flex-col items-center space-y-2 z-50">
    <div className="video-header text-center">
      {isEditingName ? (
        <input
          type="text"
          defaultValue={userName}
          onBlur={(e) => handleNameChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleNameChange(e.target.value)}
          autoFocus
          className="input text-lg p-2 rounded-md bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
      ) : (
        <h3
          onClick={() => setIsEditingName(true)}
          className="text-sm sm:text-lg cursor-pointer hover:underline"
        >
          {userName}
        </h3>
      )}
    </div>
    <h5>You</h5>
    <video
      ref={myVideoRef}
      className="rounded-lg border border-white shadow-xl w-32 h-32 sm:w-48 sm:h-48"
      autoPlay
      muted
    />
  </div>

  {/* Controls Section */}
  <div className="controls-section flex justify-around items-center w-full max-w-lg px-4 py-3 bg-richblack-900 rounded-full fixed bottom-4 sm:bottom-6 space-x-4 z-40">
    <FontAwesomeIcon
      icon={isMuted ? faMicrophoneSlash : faMicrophone}
      onClick={toggleAudio}
      className="control-icon cursor-pointer text-xl sm:text-2xl"
    />
    <FontAwesomeIcon
      icon={isVideoOff ? faVideoSlash : faVideo}
      onClick={toggleVideo}
      className="control-icon cursor-pointer text-xl sm:text-2xl"
    />
    <FontAwesomeIcon
      icon={faPhoneSlash}
      onClick={leaveCall}
      className="control-icon text-red-500 cursor-pointer text-xl sm:text-2xl"
    />
    <FontAwesomeIcon
      icon={faLink}
      onClick={copyUrlToClipboard}
      className="control-icon cursor-pointer text-xl sm:text-2xl"
    />
  </div>
</div>


  );
};

export default Room;
