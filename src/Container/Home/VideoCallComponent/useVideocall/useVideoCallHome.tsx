import {useEffect, useState} from 'react';
import {useSocket} from '../../../../util/socket.io';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices, 
  MediaStream,
  MediaStreamTrack, // ✅ Đảm bảo import đúng
  registerGlobals
} from 'react-native-webrtc';;
const userVideoCallHome = (navigation: any, route: any) => {
  const {caller, roomId, userCall, paticipantId, conversation} = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const socket = useSocket();

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle speaker on/off
  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        // @ts-ignore: switchCamera is a custom method provided by react-native-webrtc
        track._switchCamera();
      });
      setIsFrontCamera(!isFrontCamera);
    }
  };

  const endCall = () => {
    // Dừng tất cả các track trong localStream để tắt mic và camera
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop(); // Dừng track để giải phóng thiết bị
      });
      setLocalStream(null); // Xóa localStream khỏi state
    }

    // Đóng kết nối peer
    if (peer) {
      peer.close();
      setPeer(null); // Xóa peer khỏi state
    }
    // Gửi tín hiệu kết thúc cuộc gọi qua socket
    socket?.emit('endCall', { conversationId: roomId });

    // Quay lại màn hình trước đó
    navigation.goBack();
  };

  useEffect(() => {
    const setupWebRTC = async () => {
      try {
        // ✅ Lấy video/audio stream từ thiết bị
        const stream: MediaStream  = await mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!stream) throw new Error('Không lấy được MediaStream');
        setLocalStream(prevStream => {
          if (prevStream) {
            prevStream.release(); // Giải phóng stream cũ nếu có
          }
          return stream;
        });
  

        const newPeer = new RTCPeerConnection();

        // ✅ Thêm tracks vào peerConnection
        stream.getTracks().forEach(track => {
          newPeer.addTrack(track, stream);
        });

        // Lắng nghe ICE candidate
        if ('onicecandidate' in newPeer) {
          newPeer.onicecandidate = event => {
            if (event.candidate) {
              socket?.emit('sendSignal', {
                signal: event.candidate,
                userToSignal: caller.socketId,
                roomId,
              });
            }
          };
        } else {
          console.warn('RTCPeerConnection không hỗ trợ onicecandidate');
        }

        setPeer(newPeer);

        // ✅ Nếu là người nhận, tạo và gửi Offer SDP
        const offer = await newPeer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await newPeer.setLocalDescription(offer);

        socket?.emit('sendSignal', {
          signal: offer,
          userToSignal: caller.socketId,
          roomId,
        });
      } catch (error) {
        console.error('Lỗi thiết lập WebRTC:', error);
      }
    };

    setupWebRTC();

    // ✅ Nhận phản hồi SDP từ người gọi
    socket?.on('signalAnswer', async ({signal}) => {
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    // ✅ Nhận ICE Candidate từ người gọi
    socket?.on('receiveSignal', async ({signal}) => {
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(signal));
      }
    });

    return () => {
      socket?.off('signalAnswer');
      socket?.off('receiveSignal');
      peer?.close();
    };
  }, [socket]);

  return {
    isMuted,
    isSpeakerOn,
    isVideoOn,
    isFrontCamera,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    endCall,
    localStream,
    remoteStream,
  };
};

export default userVideoCallHome;
