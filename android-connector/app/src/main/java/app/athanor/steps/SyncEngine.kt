package app.athanor.steps

import android.content.Context
import androidx.health.connect.client.permission.HealthPermission
import androidx.work.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.time.Instant
import java.util.concurrent.TimeUnit

object SyncEngine {
    private const val WORK = "athanor-step-sync"
    private val mutex = Mutex()
    fun cancel(context: Context) { WorkManager.getInstance(context).cancelUniqueWork(WORK) }
    suspend fun configure(context: Context) {
        val store = PrivateStore(context)
        val connection = store.read()
        val health = HealthSteps(context)
        val permissions = health.permissions()
        if (connection?.timezoneAccepted != true || !health.supportsBackground() || !permissions.containsAll(health.requestedPermissions())) { cancel(context); return }
        val work = PeriodicWorkRequestBuilder<StepSyncWorker>(1, TimeUnit.HOURS, 15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES).build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(WORK, ExistingPeriodicWorkPolicy.KEEP, work)
    }
    suspend fun sync(context: Context, background: Boolean = false) = mutex.withLock {
        val store = PrivateStore(context)
        val connection = store.read() ?: return@withLock
        if (!connection.timezoneAccepted) { store.status = "Confirm the time zone before syncing."; return@withLock }
        val health = HealthSteps(context)
        val permissions = health.permissions()
        if (!permissions.contains(HealthSteps.READ_STEPS)) { store.status = "Allow steps in Health Connect, then tap Sync now."; cancel(context); return@withLock }
        if (background && (!health.supportsBackground() || !permissions.contains(HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND))) {
            store.status = "Allow background reading for automatic uploads. Sync now still works when this app is open."; cancel(context); return@withLock
        }
        try {
            val now = Instant.now()
            val days = health.totals(connection, now)
            if (days.length() == 0) { store.status = "No Samsung Health steps available yet. Open Samsung Health and check its Health Connect steps permission."; return@withLock }
            if (store.read()?.token != connection.token) return@withLock
            val result = withContext(Dispatchers.IO) { SyncApi.request("/api/health-connect/steps", JSONObject().put("version", 1).put("source", "samsung-health").put("timezone", connection.timezone).put("days", days), connection.token) }
            if (store.read()?.token != connection.token) return@withLock
            val results = result.getJSONArray("results")
            val kept = (0 until results.length()).count { results.getJSONObject(it).optString("status") == "manual-entry-kept" }
            store.lastSuccess = now.toString()
            store.status = if (kept > 0) "Upload confirmed. $kept manually entered day(s) kept." else "Samsung Health totals uploaded."
        } catch (error: ApiFailure) {
            if (error.status in setOf(401, 409)) { store.clear(); cancel(context); store.status = error.message ?: "Pair again in Athanor." }
            else throw error
        } catch (_: SecurityException) { store.status = "Health Connect permission changed. Allow steps again."; cancel(context) }
    }
    suspend fun disconnect(context: Context) = mutex.withLock {
        val store = PrivateStore(context)
        val token = store.read()?.token
        store.clear(); cancel(context)
        store.status = "Disconnected. Saved Athanor totals are unchanged."
        if (token != null) try { withContext(Dispatchers.IO) { SyncApi.request("/api/health-connect/steps", token = token, method = "DELETE") } }
        catch (error: CancellationException) { throw error }
        catch (_: Exception) { store.status = "Phone stopped syncing. Disconnect on the Athanor website too, to revoke its server key." }
    }
}
class StepSyncWorker(context: Context, parameters: WorkerParameters) : CoroutineWorker(context, parameters) {
    override suspend fun doWork(): Result = try { SyncEngine.sync(applicationContext, background = true); Result.success() }
    catch (error: CancellationException) { throw error }
    catch (_: Exception) { PrivateStore(applicationContext).status = "Upload not confirmed. Android will retry when connected."; Result.retry() }
}
