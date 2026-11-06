package app.athanor.steps

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputFilter
import android.text.InputType
import android.view.View
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.HealthConnectClient
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle

class StepConnectionActivity : ComponentActivity() {
    private lateinit var body: LinearLayout
    private var busy = false
    private var codeInput: EditText? = null
    private var codeDraft = ""
    private val store get() = PrivateStore(this)
    private val permissions = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) {
        operate { store.status = if (HealthSteps(this).permissions().contains(HealthSteps.READ_STEPS)) "Steps allowed. Pair or tap Sync now." else "Steps permission is needed to sync." }
    }
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); codeDraft = savedInstanceState?.getString("codeDraft") ?: ""; render() }
    override fun onSaveInstanceState(outState: Bundle) { outState.putString("codeDraft", codeInput?.text?.toString() ?: codeDraft); super.onSaveInstanceState(outState) }
    override fun onResume() {
        super.onResume()
        if (!busy) lifecycleScope.launch { try { SyncEngine.configure(this@StepConnectionActivity) } catch (_: Exception) { store.status = "Open Health Connect and check steps permissions." }; if (!busy) render() }
    }
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    private fun text(value: String, size: Float = 16f, bold: Boolean = false): TextView {
        return TextView(this).apply {
            text = value; textSize = size; setTextColor(Color.rgb(40, 55, 49)); setLineSpacing(dp(4).toFloat(), 1f)
            if (bold) setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) }
            body.addView(this)
        }
    }
    private fun rule() { body.addView(View(this).apply { setBackgroundColor(Color.rgb(211, 213, 204)); layoutParams = LinearLayout.LayoutParams(-1, dp(1)).apply { topMargin = dp(16); bottomMargin = dp(24) } }) }
    private fun button(label: String, action: () -> Unit) {
        body.addView(Button(this).apply {
            text = label; isAllCaps = false; textSize = 16f; minHeight = dp(56); isEnabled = !busy
            setOnClickListener { action() }
            layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(8) }
        })
    }
    private fun open(url: String) { try {
        val intent = if (url.startsWith(SyncApi.ORIGIN + "/")) Intent(this, MainActivity::class.java).setData(Uri.parse(url)) else Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent) } catch (_: Exception) { store.status = "Open $url in your browser."; render() } }
    private fun render() {
        codeDraft = codeInput?.text?.toString() ?: codeDraft
        codeInput = null
        val scroll = ScrollView(this).apply { setBackgroundColor(Color.rgb(247, 245, 238)); isFillViewport = true }
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(24), dp(24), dp(24), dp(32)) }
        scroll.addView(body)
        ViewCompat.setOnApplyWindowInsetsListener(scroll) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom); insets
        }
        setContentView(scroll)
        button("Open Athanor") { open(SyncApi.ORIGIN + "/") }
        text("ATHANOR / STEP CONNECTION", 13f, true)
        text("Your daily movement,\nautomatically recorded.", 28f, true)
        text("Samsung Health → Health Connect → Athanor", 14f)
        rule()
        text(if (busy) "Working…" else store.status, 17f, true).apply { accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE }
        store.lastSuccess?.let { time ->
            val label = try { DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM, FormatStyle.SHORT).withZone(ZoneId.systemDefault()).format(Instant.parse(time)) } catch (_: Exception) { time }
            text("Last confirmed upload: $label", 14f)
        }
        val health = HealthSteps(this)
        if (!health.available()) {
            text("Install or update Health Connect before pairing. On recent Samsung phones it is part of Android Settings.")
            button("Open Health Connect setup") { open("https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata") }
        } else {
            button("Allow steps and background reading") { permissions.launch(health.requestedPermissions()) }
            if (!health.supportsBackground()) text("This Health Connect version does not support background reading. Update it for automatic uploads; Sync now works while the step connection screen is open.", 14f)
        }
        val connection = store.read()
        rule()
        if (connection == null) {
            text("Pair your phone", 22f, true)
            text("Create a one-time code on Athanor’s Automatic steps page. This app never needs your password.")
            button("Open Athanor pairing page") { open(SyncApi.ORIGIN + "/steps/connect") }
            codeInput = EditText(this).apply {
                hint = "ABCD-EFGH-2345"; contentDescription = "One-time pairing code"
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
                filters = arrayOf(InputFilter.AllCaps(), InputFilter.LengthFilter(18)); setSingleLine(true); textSize = 22f
                setText(codeDraft); minHeight = dp(60)
                layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) }
                body.addView(this)
            }
            button("Pair with Athanor") {
                val code = codeInput?.text?.toString()?.replace(Regex("[\\s-]"), "")?.uppercase() ?: ""
                if (!Regex("[A-HJ-NP-Z2-9]{12}").matches(code)) { codeInput?.error = "Enter the 12-character code from Athanor."; return@button }
                operate {
                    check(health.permissions().contains(HealthSteps.READ_STEPS)) { "Allow steps first, then pair." }
                    val result = withContext(Dispatchers.IO) { SyncApi.request("/api/health-connect/pair", JSONObject().put("code", code).put("deviceLabel", Build.MODEL.take(80))) }
                    check(result.getInt("version") == 1 && Regex("[A-Za-z0-9_-]{43}").matches(result.getString("token"))) { "Unexpected pairing response. Create a new code and retry." }
                    LocalDate.parse(result.getString("startedOn"))
                    val zone = ZoneId.of(result.getString("timezone"))
                    val sameZone = zone.rules == ZoneId.systemDefault().rules
                    store.save(Connection(result.getString("token"), zone.id, result.getString("startedOn"), sameZone))
                    codeDraft = ""; codeInput?.setText("")
                    store.status = "Paired. Confirm permissions and time zone to begin."
                    if (sameZone) SyncEngine.sync(this)
                }
            }
        } else {
            text("Phone paired", 22f, true)
            text("Daily totals: ${connection.timezone}\nPhone time zone: ${ZoneId.systemDefault().id}", 15f)
            if (!connection.timezoneAccepted) {
                text("These time zones differ. For matching calendar days, change your Athanor time zone in Settings and pair again. Or explicitly choose to group steps using the Athanor time zone.")
                button("Open Athanor Settings") { open(SyncApi.ORIGIN + "/settings") }
                button("Use ${connection.timezone} for daily totals") { operate { store.save(connection.copy(timezoneAccepted = true)); SyncEngine.sync(this) } }
            } else button("Sync now") { operate { SyncEngine.sync(this) } }
            button("View steps in Athanor") { open(SyncApi.ORIGIN + "/steps") }
            button("Disconnect this phone") { operate { SyncEngine.disconnect(this) } }
        }
        rule()
        text("Steps only. Your choice.", 18f, true)
        text("Only Samsung Health daily step totals from your pairing day onward are sent. Existing manual entries and corrections are kept. Uploads run about hourly when Android allows; battery restrictions and internet access can delay them. No other health data is read or uploaded.", 14f)
        button("Permissions and privacy") { startActivity(Intent(this, PermissionsActivity::class.java)) }
    }
    private fun operate(operation: suspend () -> Unit) {
        if (busy) return
        busy = true; render()
        lifecycleScope.launch {
            try { operation() }
            catch (error: CancellationException) { throw error }
            catch (error: Exception) { store.status = if (error is ApiFailure) error.message ?: "Retry in a moment." else if (error is IllegalStateException) error.message ?: "Check setup and retry." else "Could not confirm the upload. Check your connection and retry safely." }
            finally { try { SyncEngine.configure(this@StepConnectionActivity) } catch (_: Exception) { /* Existing status remains visible. */ }; busy = false; render() }
        }
    }
}
