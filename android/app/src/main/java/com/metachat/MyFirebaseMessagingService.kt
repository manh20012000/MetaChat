package com.metachat

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    // Khi thiết bị nhận token mới
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("MyFirebaseMessagingService", "New token: $token")
        // TODO: Gửi token này lên server nếu cần
    }

    // Khi thiết bị nhận được một message
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d("MyFirebaseMessagingService", "From: ${remoteMessage.from}")

        // Nếu message chứa data payload
        remoteMessage.data.let { data ->
            Log.d("MyFirebaseMessagingService", "Message data payload: $data")

            val type = data["type"]
            val callerName = data["callerName"] ?: "Unknown"
            val roomId = data["roomId"] ?: ""
            val messageBody = data["message"] ?: ""

            val notificationHelper = NotificationHelper(this)

            when (type) {
                "video_call" -> {
                    // Nếu là cuộc gọi video
                    notificationHelper.showIncomingCallNotification(callerName, roomId)
                }
                "message" -> {
                    // Nếu là tin nhắn
                    notificationHelper.showMessageNotification(callerName, messageBody)
                }
               // else -> {
                    // Các loại khác
                    //notificationHelper.showGeneralNotification("Thông báo", "Bạn có một thông báo mới.")
               // }
            }
        }
    }
}
