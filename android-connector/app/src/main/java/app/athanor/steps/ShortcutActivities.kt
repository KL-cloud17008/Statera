package app.athanor.steps

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.google.androidbrowserhelper.trusted.ShortcutTrampolineActivity

/** Isolated shortcut tasks prevent Android's CLEAR_TASK flag closing an active workout. */
class WebShortcutActivity : ShortcutTrampolineActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        intent?.data = Uri.parse(AppDestination.launchUrl(intent?.dataString))
        super.onCreate(savedInstanceState)
    }
}

class StepShortcutActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try { startActivity(Intent(this, StepConnectionActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
        finally { finish() }
    }
}
