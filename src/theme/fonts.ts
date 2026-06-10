/** useFonts에 등록한 이름과 style.fontFamily가 같아야 합니다. */
export const FONT_FAMILY = 'AppleSDGothicNeoEB';

export const fontAssets = {
  [FONT_FAMILY]: require('../../assets/font/AppleSDGothicNeoEB.ttf'),
};

/**
 * AppleSDGothicNeoEB는 ExtraBold 단일 굵기만 포함합니다.
 * fontWeight를 함께 쓰면 OS가 다른 굵기를 찾다 시스템 폰트로 대체됩니다.
 */
export const appFont = {
  fontFamily: FONT_FAMILY,
} as const;
