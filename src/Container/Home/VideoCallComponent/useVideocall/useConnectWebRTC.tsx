import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

const useConnectWebRTC = (roomId: string, socket: Socket, user: any, isCaller: boolean) => {
  const [stream, setStream] = useState<MediaStream | null>(null); // Video stream local
  const [peer, setPeer] = useState<Peer.Instance | null>(null); // Peer connection
  const [callEnded, setCallEnded] = useState(false); // Trạng thái cuộc gọi đã kết thúc hay chưa
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null); // Video stream của người nhận

  const userVideoRef = useRef<HTMLVideoElement | null>(null); // Tham chiếu đến video local
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null); // Tham chiếu đến video remote

  useEffect(() => {
    const initWebRTC = async () => {
      // Get local video stream
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(localStream);

      // Set local video stream
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = localStream;
      }

      // Thiết lập peer connection
      const peerConnection = new Peer({
        initiator: isCaller,
        trickle: false,
        stream: localStream,
      });

      // Lắng nghe sự kiện stream từ remote
      peerConnection.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      // Xử lý khi peer connection đóng
      peerConnection.on('close', () => {
        setCallEnded(true);
      });

      setPeer(peerConnection);

      // Gửi tín hiệu lên server khi kết nối sẵn sàng
      socket.emit('join_room', roomId);
    };

    initWebRTC();

    return () => {
      // Dọn dẹp khi component bị unmount
      if (peer) {
        peer.destroy();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Dừng stream khi kết thúc
      }
    };
  }, [roomId, socket, isCaller]);

  // Hàm xử lý nhận cuộc gọi
  const handleAcceptCall = () => {
    if (peer) {
      peer.signal();
    }
  };

  // Hàm kết thúc cuộc gọi
  const handleEndCall = () => {
    setCallEnded(true);
    if (peer) {
      peer.destroy();
    }
    socket.emit('end_call', roomId); 
  };

  // Hàm gửi tín hiệu từ người gọi đến người nhận
  const handleSignal = (signal: string) => {
    if (peer) {
      peer.signal(signal);
    }
  };

  return {
    stream,
    remoteStream,
    userVideoRef,
    remoteVideoRef,
    callEnded,
    handleAcceptCall,
    handleEndCall,
    handleSignal,
  };
};

export default useConnectWebRTC;
