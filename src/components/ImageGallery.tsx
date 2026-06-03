import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/theme/ThemeProvider';

export function ImageGallery({ images }: { images: string[] }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {images.map((uri, i) => (
          <Image
            key={`${uri}-${i}`}
            source={{ uri }}
            style={{ width, height: width, backgroundColor: theme.colors.surfaceAlt }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            alignSelf: 'center',
            position: 'absolute',
            bottom: theme.spacing.md,
          }}
        >
          {images.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? theme.colors.primary : theme.colors.surface,
                opacity: i === index ? 1 : 0.7,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
