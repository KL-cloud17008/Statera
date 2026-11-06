package app.athanor.steps

import android.app.Activity
import android.os.Bundle
import android.widget.ScrollView
import android.widget.TextView
import android.graphics.Color

class PermissionsActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val padding = (24 * resources.displayMetrics.density).toInt()
        val text = TextView(this).apply {
            setPadding(padding, padding * 2, padding, padding * 2); textSize = 17f
            setTextColor(Color.rgb(40, 55, 49)); setBackgroundColor(Color.rgb(247, 245, 238))
            text = "Athanor\n\nPermissions & privacy\n\nThis personal companion reads daily step totals written by Samsung Health to Health Connect. It does not write to Health Connect or read weight, workouts, location or other health records.\n\nBackground reading lets Android upload totals when the app is closed. Uploads use encrypted HTTPS to stateraone.vercel.app, linked to your account by a steps-only device key. The device key is encrypted using Android Keystore. Your password is never given to this app.\n\nOnly dates from pairing onward, with up to seven days of catch-up, are uploaded. Previously entered totals and manual corrections take priority.\n\nYou can revoke permissions in Android Settings → Health Connect → App permissions → Athanor. Disconnect in the app or on Athanor’s Automatic steps page to revoke the device key. Saved totals remain until you delete them in Athanor. Clearing or restoring Athanor data revokes the connected phone.\n\nThis APK is for personal installation, not a Google Play listing."
        }
        setContentView(ScrollView(this).apply { addView(text) })
    }
}
