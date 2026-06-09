// Root build file — versions are declared in gradle/libs.versions.toml (catalog) in a real build.
plugins {
    alias(libs.plugins.multiplatform) apply false
    alias(libs.plugins.compose) apply false
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.serialization) apply false
}
