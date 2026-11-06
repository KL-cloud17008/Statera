package app.athanor.steps

import org.junit.Assert.*
import org.junit.Test
import java.time.*

class SyncWindowTest {
    @Test fun `pairing day is the oldest allowed day`() {
        val days = SyncWindow.days(LocalDate.parse("2026-11-05"), ZoneId.of("America/New_York"), Instant.parse("2026-11-06T17:00:00Z"))
        assertEquals(listOf("2026-11-05", "2026-11-06"), days.map { it.date.toString() })
        assertEquals(Instant.parse("2026-11-06T17:00:00Z"), days.last().end)
    }
    @Test fun `fall daylight saving day spans 25 hours`() {
        val days = SyncWindow.days(LocalDate.parse("2026-10-01"), ZoneId.of("America/New_York"), Instant.parse("2026-11-06T17:00:00Z"))
        assertEquals(7, days.size)
        val day = days.first { it.date.toString() == "2026-11-01" }
        assertEquals(25, Duration.between(day.start, day.end).toHours())
    }
    @Test fun `future pairing date and midnight have no readable window`() {
        assertTrue(SyncWindow.days(LocalDate.parse("2026-11-07"), ZoneId.of("UTC"), Instant.parse("2026-11-06T17:00:00Z")).isEmpty())
        assertTrue(SyncWindow.days(LocalDate.parse("2026-11-06"), ZoneId.of("UTC"), Instant.parse("2026-11-06T00:00:00Z")).isEmpty())
    }
}
