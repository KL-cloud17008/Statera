package app.athanor.steps

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

/** Exercises the Android lifecycle and real merged manifest, rather than only URL parsing. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28, 35])
class LauncherActivityTest {
    @Test fun `launcher creates with no installed browser without crashing`() {
        val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        Robolectric.buildActivity(MainActivity::class.java, intent).use { controller ->
            controller.create().start().resume()
        }
    }

    @Test fun `browser settings activity required during every launch is registered`() {
        val context = RuntimeEnvironment.getApplication()
        val component = ComponentName(context, ManageDataLauncherActivity::class.java)
        val info = context.packageManager.getActivityInfo(component,
            PackageManager.GET_META_DATA or PackageManager.MATCH_DISABLED_COMPONENTS)
        assertEquals("https://stateraone.vercel.app/",
            info.metaData.getString("android.support.customtabs.trusted.MANAGE_SPACE_URL"))
    }
}
