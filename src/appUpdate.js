// Play uygulama içi güncelleme: yeni sürüm varsa Play'in kendi penceresiyle
// arka planda indirir; inince oyunda "yeniden başlat" düğmesi gösterilir.
import { Capacitor } from '@capacitor/core';
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

export async function checkForUpdate(onDownloaded) {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    const info = await AppUpdate.getAppUpdateInfo();
    if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
      onDownloaded();
      return;
    }
    if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) return;

    if (info.flexibleUpdateAllowed) {
      await AppUpdate.removeAllListeners();
      await AppUpdate.addListener('onFlexibleUpdateStateChange', (state) => {
        if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) onDownloaded();
      });
      await AppUpdate.startFlexibleUpdate();
    } else if (info.immediateUpdateAllowed) {
      await AppUpdate.performImmediateUpdate();
    }
  } catch {
    // Play Store yoksa (sideload, emülatör) ya da kullanıcı reddettiyse sessiz geç.
  }
}

export function completeUpdate() {
  return AppUpdate.completeFlexibleUpdate().catch(() => {});
}
