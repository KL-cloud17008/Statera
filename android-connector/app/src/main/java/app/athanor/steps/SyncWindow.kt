package app.athanor.steps

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

data class DayWindow(val date: LocalDate, val start: Instant, val end: Instant)
object SyncWindow {
    fun days(startedOn: LocalDate, zone: ZoneId, now: Instant): List<DayWindow> {
        val today = now.atZone(zone).toLocalDate()
        var date = maxOf(startedOn, today.minusDays(6))
        val windows = mutableListOf<DayWindow>()
        while (!date.isAfter(today)) {
            val start = date.atStartOfDay(zone).toInstant()
            val end = minOf(date.plusDays(1).atStartOfDay(zone).toInstant(), now)
            if (start < end) windows.add(DayWindow(date, start, end))
            date = date.plusDays(1)
        }
        return windows
    }
}
