plugins {
    alias(libs.plugins.androidApplication)
    id("org.jetbrains.kotlin.android") version "2.0.20"
    alias(libs.plugins.composeMultiplatform)
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20"
}

// Android is OPTIONAL in Atlaz v4 (iOS-first). It exists so the same shared
// Compose UI can be demoed on Android without any product-code changes.
android {
    namespace = "com.atlaz.android"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.atlaz.android"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "4.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
}

dependencies {
    implementation(project(":shared"))
    implementation(compose.runtime)
    implementation(compose.foundation)
    implementation(compose.material3)
    implementation(compose.ui)
    implementation("androidx.activity:activity-compose:1.9.2")
}
