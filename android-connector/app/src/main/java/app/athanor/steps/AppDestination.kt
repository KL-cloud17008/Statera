package app.athanor.steps

import java.net.URI

/** Exported launcher intents may only select pages on our production origin. */
object AppDestination {
    const val HOME = "https://stateraone.vercel.app/"
    private val sections = setOf("workout", "weight", "steps", "mobility", "flexibility-balance", "settings", "login", "android")
    fun launchUrl(input: String?): String {
        if (input == null) return HOME
        return try {
            val uri = URI(input)
            val path = uri.path ?: "/"
            val allowedPath = path == "/" || (path.startsWith("/") && path.split('/').getOrNull(1) in sections)
            if (uri.scheme != "https" || uri.host != "stateraone.vercel.app" || uri.port !in setOf(-1, 443) || uri.userInfo != null ||
                !allowedPath || path.contains('\\') || path.split('/').any { it == "." || it == ".." }) HOME else uri.toASCIIString()
        } catch (_: Exception) { HOME }
    }
}
