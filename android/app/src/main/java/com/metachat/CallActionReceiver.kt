package com.metachat

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        when (action) {
            "ACTION_ACCEPT" -> {  // <<< phải trùng khớp
                Toast.makeText(context, "Cuộc gọi được chấp nhận", Toast.LENGTH_SHORT).show()
            }
            "ACTION_REJECT" -> { // <<< phải trùng khớp
                Toast.makeText(context, "Cuộc gọi bị từ chối", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
