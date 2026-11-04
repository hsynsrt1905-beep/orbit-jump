# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- Orbit Jump (1.0.18, R8 açıldı) ---
# Crashlytics: okunur yığın izleri için satır numaraları
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-keep public class * extends java.lang.Exception
# Uygulamanın kendi sınıfları (MainActivity, PlayGamesPlugin)
-keep class com.orbitjump.game.** { *; }
# WebView JS köprüsü
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
# Capacitor çekirdeği ve eklentileri (yansıma ile çağrılır)
-keep class com.getcapacitor.** { *; }
-keep class io.capawesome.** { *; }
-keep class com.capacitorjs.** { *; }
-keep class io.ionic.** { *; }
-dontwarn com.google.android.gms.**
# firebase-authentication eklentisinin kullanmadığımız isteğe bağlı sağlayıcıları
-dontwarn com.facebook.**
-dontwarn com.twitter.**
-dontwarn kotlin.uuid.**
