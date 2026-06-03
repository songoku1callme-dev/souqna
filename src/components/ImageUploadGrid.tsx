import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export type ImageUploadGridProps = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
};

export function ImageUploadGrid({ images, onChange, max = 6 }: ImageUploadGridProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: max - images.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      onChange([...images, ...uris].slice(0, max));
    }
  };

  const remove = (uri: string) => onChange(images.filter((i) => i !== uri));

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      {images.map((uri) => (
        <View key={uri}>
          <Image
            source={{ uri }}
            style={{
              width: 88,
              height: 88,
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.surfaceAlt,
            }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => remove(uri)}
            style={{
              position: 'absolute',
              top: -6,
              insetInlineEnd: -6,
              backgroundColor: theme.colors.danger,
              borderRadius: 11,
              width: 22,
              height: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={t('common.remove')}
          >
            <Ionicons name="close" size={14} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      ))}
      {images.length < max ? (
        <Pressable
          onPress={pick}
          style={{
            width: 88,
            height: 88,
            borderRadius: theme.radii.md,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Ionicons name="camera-outline" size={22} color={theme.colors.textMuted} />
          <Text variant="caption" color="textMuted">
            {t('createListing.addPhoto')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
