package com.metachat

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat

class NotificationHelper(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "incoming_call_channel"
        const val CHANNEL_NAME = "Incoming Call Notifications"
    }

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel for incoming call notifications"
                enableLights(true)
                lightColor = Color.RED
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun showIncomingCallNotification(callerName: String, callUUID: String) {
    val acceptIntent = Intent(context, CallActionReceiver::class.java).apply {
        action = "ACTION_ACCEPT"
        putExtra("CALL_UUID", callUUID)
    }
    val acceptPendingIntent = PendingIntent.getBroadcast(
        context,
        1,
        acceptIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val rejectIntent = Intent(context, CallActionReceiver::class.java).apply {
        action = "ACTION_REJECT"
        putExtra("CALL_UUID", callUUID)
    }
    val rejectPendingIntent = PendingIntent.getBroadcast(
        context,
        2,
        rejectIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setContentTitle("Cuộc gọi đến nha")
        .setContentText("Từ $callerName")
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setCategory(NotificationCompat.CATEGORY_CALL) // <- CỰC KỲ QUAN TRỌNG
        .setOngoing(true) // <- Giữ notification không tự tắt
        .addAction(R.drawable.ic_accept, "Chấp nhận", acceptPendingIntent)
        .addAction(R.drawable.ic_reject, "Từ chối", rejectPendingIntent)
        .setFullScreenIntent(acceptPendingIntent, true) // <- Comment dòng này nếu không muốn full screen popup
        .build()

    notificationManager.notify(1001, notification)
}


    fun showMessageNotification(senderName: String, message: String) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(senderName)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(1002, notification)
    }
}
