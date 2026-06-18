import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    // iOS-first: iOS targets are the primary deliverable.
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"
            isStatic = true
            // Exposes AtlazRootViewController() to SwiftUI shell.
            export(project(":shared"))
        }
    }

    // Android is an OPTIONAL secondary target.
    androidTarget {
        compilations.all {
            kotlinOptions { jvmTarget = "1.8" }
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)
                implementation(libs.kotlin.coroutines.core)
                implementation(libs.kotlinx.serialization.json)
                implementation(libs.sqldelight.runtime)
                implementation(libs.sqldelight.coroutines)
            }
        }
        val androidMain by getting {
            dependencies {
                implementation(libs.sqldelight.android)
                implementation(libs.androidx.activity.compose)
            }
        }
        val iosMain by creating {
            dependsOn(commonMain)
            dependencies {
                implementation(libs.sqldelight.native)
            }
        }
        val iosX64Main by getting { dependsOn(iosMain) }
        val iosArm64Main by getting { dependsOn(iosMain) }
        val iosSimulatorArm64Main by getting { dependsOn(iosMain) }
    }
}

android {
    namespace = "com.atlaz.shared"
    compileSdk = 34
    defaultConfig { minSdk = 24 }
}
