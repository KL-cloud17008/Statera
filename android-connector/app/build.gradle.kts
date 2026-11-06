plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "app.athanor.steps"
    compileSdk = 36
    defaultConfig {
        applicationId = "app.athanor.steps"
        minSdk = 28
        targetSdk = 35
        versionCode = 3
        versionName = "1.1.1"
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    testOptions { unitTests.isIncludeAndroidResources = true }
    lint { abortOnError = true }
}
dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.4")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("androidx.work:work-runtime-ktx:2.10.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.robolectric:robolectric:4.16.1")
}
