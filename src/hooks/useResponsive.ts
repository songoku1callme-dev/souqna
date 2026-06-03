import { useWindowDimensions } from 'react-native';

/**
 * Mobile-first responsive helper.
 *
 * Souqna is a mobile app (phones + tablets); it must never look like a
 * stretched desktop site. On wide viewports (tablets, and the dev-only web
 * build) we cap content to a comfortable "device canvas" width and center it,
 * and we only widen grids on true tablet sizes.
 *
 * Mandatory checkpoints: 390 (iPhone), 412 (Android), 768 (tablet/iPad).
 */
export type DeviceClass = 'phone' | 'tablet';

export type Responsive = {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  isTablet: boolean;
  /** Max width the screen content should occupy (centered when narrower than the viewport). */
  maxContentWidth: number;
  /** Preferred column count for listing grids. */
  gridColumns: number;
};

/** Width at/above which we treat the layout as a tablet. */
export const TABLET_BREAKPOINT = 700;

/** Phone content is capped so very wide web windows still feel phone-sized. */
const PHONE_CANVAS_MAX = 560;
/** Tablet content stays readable rather than spanning the whole panel. */
const TABLET_CANVAS_MAX = 760;

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  return {
    width,
    height,
    deviceClass: isTablet ? 'tablet' : 'phone',
    isTablet,
    maxContentWidth: isTablet ? TABLET_CANVAS_MAX : PHONE_CANVAS_MAX,
    gridColumns: isTablet ? 3 : 2,
  };
}
