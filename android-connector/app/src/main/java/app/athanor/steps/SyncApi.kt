package app.athanor.steps

import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

class ApiFailure(val status: Int, message: String) : Exception(message)
object SyncApi {
    const val ORIGIN = "https://stateraone.vercel.app"
    fun request(path: String, json: JSONObject? = null, token: String? = null, method: String = "POST"): JSONObject {
        require(path in setOf("/api/health-connect/pair", "/api/health-connect/steps"))
        val connection = URL(ORIGIN + path).openConnection() as HttpsURLConnection
        try {
            connection.requestMethod = method
            connection.instanceFollowRedirects = false
            connection.connectTimeout = 20_000; connection.readTimeout = 30_000
            connection.setRequestProperty("Accept", "application/json")
            token?.let { connection.setRequestProperty("Authorization", "Bearer $it") }
            if (json != null) {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                val bytes = json.toString().toByteArray(Charsets.UTF_8)
                connection.setFixedLengthStreamingMode(bytes.size)
                connection.outputStream.use { it.write(bytes) }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val bytes = stream?.use {
                val output = java.io.ByteArrayOutputStream()
                val buffer = ByteArray(4096)
                while (output.size() <= 32_768) {
                    val count = it.read(buffer, 0, minOf(buffer.size, 32_769 - output.size()))
                    if (count < 0) break
                    output.write(buffer, 0, count)
                }
                output.toByteArray()
            } ?: ByteArray(0)
            if (bytes.size > 32_768) throw ApiFailure(status, "Server response too large. Retry later.")
            val response = try { JSONObject(String(bytes, Charsets.UTF_8)) } catch (_: Exception) { JSONObject() }
            if (status !in 200..299) throw ApiFailure(status, response.optString("error", "Athanor could not confirm this request. Retry later."))
            return response
        } finally { connection.disconnect() }
    }
}
