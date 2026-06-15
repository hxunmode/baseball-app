import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Image, Platform } from "react-native";

const REWARD_FILE_NAME = "catch-to-win-reward.png";

function isFileUri(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    (uri.startsWith("/") && !uri.includes("android_res"))
  );
}

async function writeRewardCopy(sourceUri: string, dest: string): Promise<string> {
  try {
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
  } catch {
    const base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return dest;
  }
}

async function verifyRewardFile(fileUri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists || (info.size ?? 0) <= 0) {
    throw new Error("REWARD_FILE_EMPTY");
  }
}

export async function prepareRewardImageFile(
  rewardImageModule: number,
): Promise<string> {
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!baseDir) {
    throw new Error("CACHE_UNAVAILABLE");
  }

  const dest = `${baseDir}${REWARD_FILE_NAME}`;
  await FileSystem.deleteAsync(dest, { idempotent: true });

  const asset = Asset.fromModule(rewardImageModule);
  await asset.downloadAsync();

  const candidates = [
    asset.localUri,
    Image.resolveAssetSource(rewardImageModule).uri,
  ].filter((uri): uri is string => Boolean(uri));

  for (const uri of candidates) {
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      try {
        const { uri: downloaded } = await FileSystem.downloadAsync(uri, dest);
        await verifyRewardFile(downloaded);
        return downloaded;
      } catch {
        continue;
      }
    }

    if (isFileUri(uri)) {
      try {
        const saved = await writeRewardCopy(uri, dest);
        await verifyRewardFile(saved);
        return saved;
      } catch {
        continue;
      }
    }
  }

  throw new Error("REWARD_URI_UNAVAILABLE");
}

async function getShareableUri(fileUri: string): Promise<string> {
  if (Platform.OS === "android") {
    return FileSystem.getContentUriAsync(fileUri);
  }
  return fileUri;
}

export function isShareCancelled(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /cancel|dismiss|did not share|User canceled/i.test(message);
}

export async function shareRewardImage(fileUri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("SHARING_UNAVAILABLE");
  }

  const shareUri = await getShareableUri(fileUri);
  await Sharing.shareAsync(shareUri, {
    mimeType: "image/png",
    dialogTitle: "리워드 이미지 저장",
    UTI: "public.png",
  });
}

export async function saveRewardToGallery(fileUri: string): Promise<void> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error("GALLERY_PERMISSION_DENIED");
  }

  await MediaLibrary.createAssetAsync(fileUri);
}

export type RewardSaveMethod = "gallery" | "share";

export async function saveRewardImage(
  rewardImageModule: number,
  method: RewardSaveMethod,
): Promise<void> {
  const fileUri = await prepareRewardImageFile(rewardImageModule);

  if (method === "gallery") {
    await saveRewardToGallery(fileUri);
    return;
  }

  await shareRewardImage(fileUri);
}
