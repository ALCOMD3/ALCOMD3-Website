import {
    Hct,
    MaterialDynamicColors,
    SchemeVibrant,
    argbFromHex,
    hexFromArgb,
} from "@material/material-color-utilities";
import alcomd3Config from "../../alcomd3.config.json" with { type: "json" };

export const themeSeedColor = alcomd3Config.themeSeedColor;

const sourceColor = Hct.fromInt(argbFromHex(themeSeedColor));
const colorRoles = {
    primary: MaterialDynamicColors.primary,
    onPrimary: MaterialDynamicColors.onPrimary,
    primaryContainer: MaterialDynamicColors.primaryContainer,
    onPrimaryContainer: MaterialDynamicColors.onPrimaryContainer,
    secondary: MaterialDynamicColors.secondary,
    onSecondary: MaterialDynamicColors.onSecondary,
    secondaryContainer: MaterialDynamicColors.secondaryContainer,
    onSecondaryContainer: MaterialDynamicColors.onSecondaryContainer,
    tertiary: MaterialDynamicColors.tertiary,
    onTertiary: MaterialDynamicColors.onTertiary,
    tertiaryContainer: MaterialDynamicColors.tertiaryContainer,
    onTertiaryContainer: MaterialDynamicColors.onTertiaryContainer,
    error: MaterialDynamicColors.error,
    onError: MaterialDynamicColors.onError,
    errorContainer: MaterialDynamicColors.errorContainer,
    onErrorContainer: MaterialDynamicColors.onErrorContainer,
    background: MaterialDynamicColors.background,
    onBackground: MaterialDynamicColors.onBackground,
    surface: MaterialDynamicColors.surface,
    onSurface: MaterialDynamicColors.onSurface,
    surfaceVariant: MaterialDynamicColors.surfaceVariant,
    onSurfaceVariant: MaterialDynamicColors.onSurfaceVariant,
    outline: MaterialDynamicColors.outline,
    outlineVariant: MaterialDynamicColors.outlineVariant,
    shadow: MaterialDynamicColors.shadow,
    scrim: MaterialDynamicColors.scrim,
    inverseSurface: MaterialDynamicColors.inverseSurface,
    inverseOnSurface: MaterialDynamicColors.inverseOnSurface,
    inversePrimary: MaterialDynamicColors.inversePrimary,
    surfaceDim: MaterialDynamicColors.surfaceDim,
    surfaceBright: MaterialDynamicColors.surfaceBright,
    surfaceContainerLowest: MaterialDynamicColors.surfaceContainerLowest,
    surfaceContainerLow: MaterialDynamicColors.surfaceContainerLow,
    surfaceContainer: MaterialDynamicColors.surfaceContainer,
    surfaceContainerHigh: MaterialDynamicColors.surfaceContainerHigh,
    surfaceContainerHighest: MaterialDynamicColors.surfaceContainerHighest,
};

export const themeSchemes = {
    light: new SchemeVibrant(sourceColor, false, 0),
    dark: new SchemeVibrant(sourceColor, true, 0),
};

export const themeRoleValues = Object.fromEntries(
    Object.entries(themeSchemes).map(([mode, scheme]) => [
        mode,
        Object.fromEntries(
            Object.entries(colorRoles).map(([role, color]) => [
                role,
                hexFromArgb(color.getArgb(scheme)),
            ]),
        ),
    ]),
);

export const themeColors = {
    light: themeRoleValues.light.primary,
    dark: themeRoleValues.dark.primary,
};
