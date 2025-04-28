package com.metachat

import android.content.Context
import android.telecom.Connection
import android.telecom.DisconnectCause
import android.telecom.StatusHints
import android.graphics.drawable.Icon

class VoiceConnection(private val context: Context) : Connection() {

    override fun onAnswer() {
        super.onAnswer()
        setActive()
    }

    override fun onDisconnect() {
        super.onDisconnect()
        setDisconnected(DisconnectCause(DisconnectCause.LOCAL))
        destroy()
    }

    override fun onReject() {
        super.onReject()
        setDisconnected(DisconnectCause(DisconnectCause.REJECTED))
        destroy()
    }
}
