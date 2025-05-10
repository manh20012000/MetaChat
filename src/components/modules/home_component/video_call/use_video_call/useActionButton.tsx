import { useState } from 'react';

import { useSocket } from '../../../../../provinders/socket.io';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
const userActionButton = (
  localStream: MediaStream | null,
  statusCamera: boolean,
  isMicOn: boolean,
  isSpeakerOn: boolean,
  setIsMicOn: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSpeakerOn: React.Dispatch<React.SetStateAction<boolean>>,
  setStatusCamera: React.Dispatch<React.SetStateAction<boolean>>,
  setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
) => {
  const [isMuted, setIsMuted] = useState(false);

  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const socket = useSocket(); // Giả sử bạn đang sử dụng một hook socket để quản lý kết nối
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        console.log(`[handleToggleMute] BEFORE: track.enabled=${track.enabled}`);
        track.enabled = !isMicOn;
        console.log(`[handleToggleMute] AFTER: track.enabled=${track.enabled}`);
      });
      setIsMicOn(prev => {
        console.log(`[handleToggleMute] isMicOn changed: ${!prev}`);
        return !prev;
      });
    } else {
      console.log('[handleToggleMute] No localStream');
    }
  };
  

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
    // Lưu ý: react-native-webrtc không hỗ trợ trực tiếp toggle speaker, cần dùng thư viện âm thanh riêng nếu muốn điều khiển loa
  };
  // const toggleMute = () => {
  //   console.log('Toggling mute:', isMicOn, localStream);
  //   if (localStream) {
  //     localStream.getAudioTracks().forEach(track => (track.enabled = !isMicOn));
  //     setIsMicOn(prev => !prev);
  //   }
  // };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
    // Thực tế, bạn cần một thư viện riêng để quản lý speaker
  };

  const toggleVideo = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop()); // Dừng tất cả các track hiện tại
    }

    const constraints = {
      audio: true,
      video: statusCamera ? false : { width: 640, height: 480, frameRate: 30 },
    };

    try {
      const stream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(stream); // Cập nhật localStream
      setStatusCamera(!statusCamera); // Cập nhật trạng thái camera
      console.log(`Camera is now ${!statusCamera ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  };
  const switchCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled; // Tắt track hiện tại
        track._switchCamera();
      });
      setIsFrontCamera(prev => !prev);
    }
  };

  return {
    isMuted,
    isSpeakerOn,
    isFrontCamera,
    // toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    remoteStream, 
    handleToggleMute, 
    handleToggleSpeaker
  };
};

export default userActionButton;

// const endCall = () => {
//   // Dừng tất cả các track trong localStream để tắt mic và camera
//   if (localStream) {
//     localStream.getTracks().forEach(track => {
//       track.stop(); // Dừng track để giải phóng thiết bị
//     });
//   }
//   // Gửi tín hiệu kết thúc cuộc gọi qua socket
//   socket?.emit('endCall', {conversationId: roomId});
//   navigation.navigate("HomeChatPersion");
// };

// useEffect(() => {
//   const setupWebRTC = async () => {
//     try {
//       // ✅ Lấy video/audio stream từ thiết bị
//       const stream: MediaStream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: {
//           facingMode: isFrontCamera ? 'user' : 'environment',
//           width: 640,
//           height: 480,
//           frameRate: 30,
//         },
//       });
//       if (!stream) throw new Error('Không lấy được MediaStream');
//       setLocalStream(prevStream => {
//         if (prevStream) {
//           prevStream.release(); // Giải phóng stream cũ nếu có
//         }
//         return stream;
//       });

//       const newPeer = new RTCPeerConnection();

//       // ✅ Thêm tracks vào peerConnection
//       stream.getTracks().forEach(track => {
//         newPeer.addTrack(track, stream);
//       });

//       // Lắng nghe ICE candidate
//       if ('onicecandidate' in newPeer) {
//         newPeer.onicecandidate = event => {
//           if (event.candidate) {
//             socket?.emit('sendSignal', {
//               signal: event.candidate,
//               userToSignal: caller.socketId,
//               roomId,
//             });
//           }
//         };
//       } else {
//         console.warn('RTCPeerConnection không hỗ trợ onicecandidate');
//       }

//       setPeer(newPeer);

//       // ✅ Nếu là người gọi, tạo và gửi Offer SDP
//       if (isCaller) {
//         const offer = await newPeer.createOffer({
//           offerToReceiveAudio: true,
//           offerToReceiveVideo: true,
//         });
//         await newPeer.setLocalDescription(offer);

//         socket?.emit('sendSignal', {
//           signal: offer,
//           userToSignal: caller.socketId,
//           roomId,
//         });
//       }

//       // ✅ Nếu là người nhận, đợi tín hiệu Offer và trả về tín hiệu Answer
//       if (!isCaller) {
//         socket?.on('receiveSignal', async ({signal}) => {
//           const answer = await newPeer.createAnswer();
//           await newPeer.setLocalDescription(answer);
//           socket?.emit('sendSignal', {
//             signal: answer,
//             userToSignal: caller.socketId,
//             roomId,
//           });
//         });
//       }
//     } catch (error) {
//       console.error('Lỗi thiết lập WebRTC:', error);
//     }
//   };

//   setupWebRTC();

//   // ✅ Nhận phản hồi SDP từ người gọi
//   socket?.on('signalAnswer', async ({signal}) => {
//     if (peer) {
//       await peer.setRemoteDescription(new RTCSessionDescription(signal));
//     }
//   });

//   // ✅ Nhận ICE Candidate từ người gọi
//   socket?.on('receiveSignal', async ({signal}) => {
//     if (peer) {
//       await peer.addIceCandidate(new RTCIceCandidate(signal));
//     }
//   });

//   return () => {
//     socket?.off('signalAnswer');
//     socket?.off('receiveSignal');
//     peer?.close();
//   };
// }, [socket, isCaller]);
