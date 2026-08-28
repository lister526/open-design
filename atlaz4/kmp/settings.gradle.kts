pluginManagement {
    repositories { google(); gradlePluginPortal(); mavenCentral() }
}
dependencyResolutionManagement {
    repositories { google(); mavenCentral() }
}
rootProject.name = "Atlaz"
include(":shared")
include(":androidApp")
