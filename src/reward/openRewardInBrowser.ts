import { Linking } from 'react-native';
import { REWARD_PUBLIC_URL } from '../game/constants';

export async function openRewardInBrowser(): Promise<void> {
  const url = REWARD_PUBLIC_URL.trim();
  if (!url) {
    throw new Error('REWARD_PUBLIC_URL_EMPTY');
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('REWARD_URL_NOT_SUPPORTED');
  }

  await Linking.openURL(url);
}
