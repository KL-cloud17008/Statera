package app.athanor.steps

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class HealthSteps(private val context: Context) {
    companion object {
        const val SAMSUNG = "com.sec.android.app.shealth"
        val READ_STEPS = HealthPermission.getReadPermission(StepsRecord::class)
    }
    fun available() = HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE
    private fun client() = HealthConnectClient.getOrCreate(context)
    fun supportsBackground() = available() && client().features.getFeatureStatus(HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_IN_BACKGROUND) == HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
    fun requestedPermissions() = setOf(READ_STEPS) + if (supportsBackground()) setOf(HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND) else emptySet()
    suspend fun permissions() = if (available()) client().permissionController.getGrantedPermissions() else emptySet()
    suspend fun totals(connection: Connection, now: Instant): JSONArray {
        val days = JSONArray()
        for (window in SyncWindow.days(LocalDate.parse(connection.startedOn), ZoneId.of(connection.timezone), now)) {
            val aggregate = client().aggregate(AggregateRequest(
                metrics = setOf(StepsRecord.COUNT_TOTAL), timeRangeFilter = TimeRangeFilter.between(window.start, window.end),
                dataOriginFilter = setOf(DataOrigin(SAMSUNG))))
            val count = aggregate[StepsRecord.COUNT_TOTAL] ?: continue
            check(count in 0..200_000) { "Samsung Health total is outside Athanor’s accepted range. Check today’s steps." }
            days.put(JSONObject().put("date", window.date.toString()).put("steps", count).put("observedAt", now.toString()))
        }
        return days
    }
}
