package app.athanor.steps

import org.junit.Assert.assertEquals
import org.junit.Test

class AppDestinationTest {
    @Test fun `launcher opens the dashboard and accepts ledger pages and history`() {
        assertEquals(AppDestination.HOME, AppDestination.launchUrl(null))
        for (path in listOf("weight", "workout", "workout/history/session-1", "steps/connect", "settings", "mobility", "flexibility-balance")) {
            val url = AppDestination.HOME + path
            assertEquals(url, AppDestination.launchUrl(url))
        }
    }
    @Test fun `external intents cannot launch another origin or privileged scheme`() {
        for (url in listOf("http://stateraone.vercel.app/weight", "https://stateraone.vercel.app.evil.test/weight", "https://stateraone.vercel.app@evil.test/weight",
            "https://user@stateraone.vercel.app/weight", "https://stateraone.vercel.app:8443/weight", "javascript:alert(1)", "file:///data/data/app.athanor.steps/", "intent://steps", "//evil.test/weight")) {
            assertEquals(url, AppDestination.HOME, AppDestination.launchUrl(url))
        }
    }
    @Test fun `malformed paths traversal and API endpoints fall back to home`() {
        for (path in listOf("/workout/../api/sync", "/workout/%2e%2e/api/sync", "//evil.test", "/api/health-connect/steps", "/weight%5c..%5capi", "/weight bad")) {
            assertEquals(path, AppDestination.HOME, AppDestination.launchUrl("https://stateraone.vercel.app$path"))
        }
    }
    @Test fun `calendar query and anchor survive a native shortcut`() {
        val url = "https://stateraone.vercel.app/steps?backfill=2026-11-05#quick-add"
        assertEquals(url, AppDestination.launchUrl(url))
    }
}
