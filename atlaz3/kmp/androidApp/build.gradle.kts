plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.multiplatform)
    alias(libs.plugins.compose)
}

kotlin {
    androidTarget()
    sourceSets {
        val androidMain by getting {
            dependencies {
                implementation(project(":shared"))
                implementation(compose.runtime)
                implementation(compose.material3)
                implementation(libs.androidx.activity.compose)
            }
        }
    }
}

android {
    namespace = "com.atlaz.android"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.atlaz.android"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "3.0.0"
    }
    buildFeatures { compose = true }
}
