package app.athanor.steps

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONObject
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class Connection(val token: String, val timezone: String, val startedOn: String, val timezoneAccepted: Boolean)
class PrivateStore(context: Context) {
    private val prefs = context.getSharedPreferences("athanor_steps_private", Context.MODE_PRIVATE)
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        return (store.getKey("athanor_step_token", null) as? SecretKey) ?: KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder("athanor_step_token", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build())
        }.generateKey()
    }
    @Synchronized fun read(): Connection? {
        val encrypted = prefs.getString("connection", null) ?: return null
        return try {
            val parts = encrypted.split(":")
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)))
            val json = JSONObject(String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), Charsets.UTF_8))
            Connection(json.getString("token"), json.getString("timezone"), json.getString("startedOn"), json.getBoolean("timezoneAccepted"))
        } catch (_: Exception) { clear(); status = "Device key unavailable. Pair again in Athanor."; null }
    }
    @Synchronized fun save(connection: Connection) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val json = JSONObject().put("token", connection.token).put("timezone", connection.timezone).put("startedOn", connection.startedOn).put("timezoneAccepted", connection.timezoneAccepted)
        val encrypted = Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(cipher.doFinal(json.toString().toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
        check(prefs.edit().putString("connection", encrypted).commit()) { "Could not store the device key. Please retry." }
    }
    @Synchronized fun clear() { check(prefs.edit().remove("connection").remove("lastSuccess").commit()) }
    var status: String
        get() = prefs.getString("status", "Pair with Athanor to begin.")!!
        set(value) { prefs.edit().putString("status", value).apply() }
    var lastSuccess: String?
        get() = prefs.getString("lastSuccess", null)
        set(value) { prefs.edit().putString("lastSuccess", value).apply() }
}
