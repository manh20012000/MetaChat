type Participant = {
    id: string;
    socketId: string;
    stream?: MediaStream;
    peerConnection?: RTCPeerConnection;
  };
  export default Participant