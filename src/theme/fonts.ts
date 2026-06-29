import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
} from "@expo-google-fonts/atkinson-hyperlegible";
import {
  BigShouldersDisplay_500Medium,
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_900Black,
} from "@expo-google-fonts/big-shoulders-display";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from "@expo-google-fonts/jetbrains-mono";

/**
 * Maps the short family keys used in `typography.ts` to the bundled font assets.
 * Pass this object straight to `useFonts(...)` at app start (see app/index.tsx).
 */
export const fontAssets = {
  Atkinson_400Regular: AtkinsonHyperlegible_400Regular,
  Atkinson_400Regular_Italic: AtkinsonHyperlegible_400Regular_Italic,
  Atkinson_700Bold: AtkinsonHyperlegible_700Bold,
  BigShoulders_500Medium: BigShouldersDisplay_500Medium,
  BigShoulders_700Bold: BigShouldersDisplay_700Bold,
  BigShoulders_900Black: BigShouldersDisplay_900Black,
  JetBrains_400Regular: JetBrainsMono_400Regular,
  JetBrains_500Medium: JetBrainsMono_500Medium,
  JetBrains_600SemiBold: JetBrainsMono_600SemiBold,
};
