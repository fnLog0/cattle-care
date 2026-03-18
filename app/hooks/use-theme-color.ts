/**
 * Simple theme color hook — CattleCare uses a single light theme.
 * Dark mode is not currently implemented.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // CattleCare uses light theme only
  const colorFromProps = props.light;
  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[colorName];
}
