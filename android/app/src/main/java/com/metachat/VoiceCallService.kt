package com.metachat

import android.telecom.Connection
import android.telecom.ConnectionRequest
import android.telecom.ConnectionService
import android.telecom.DisconnectCause

class VoiceCallService : ConnectionService() {

    override fun onCreateIncomingConnection(
        connectionManagerPhoneAccount: android.telecom.PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        val connection = VoiceConnection(applicationContext)
        connection.setRinging()
        return connection
    }

    override fun onCreateOutgoingConnection(
        connectionManagerPhoneAccount: android.telecom.PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        val connection = VoiceConnection(applicationContext)
        connection.setDialing()
        return connection
    }
}
