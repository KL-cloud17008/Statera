package app.athanor.steps

import android.net.Uri
import com.google.androidbrowserhelper.trusted.LauncherActivity

/** Opens the complete ledger in a verified Trusted Web Activity. */
class MainActivity : LauncherActivity() {
    override fun getLaunchingUrl(): Uri = Uri.parse(AppDestination.launchUrl(intent?.dataString))
}
