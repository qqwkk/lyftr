import { Tabs } from 'expo-router'
import { House, Dumbbell, BookOpen, Apple, Scale } from 'lucide-react-native'
import { t, useLanguage } from '@lyftr/shared'
import { useTheme } from '../../src/theme/useTheme'

export default function TabsLayout() {
  useLanguage()
  const { colors, brand } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.cyan,
        tabBarInactiveTintColor: colors.txMuted,
        tabBarStyle: {
          backgroundColor: colors.raised,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('Home'), tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: t('Workouts'), tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="programs"
        options={{ title: t('Programs'), tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: t('Nutrition'), tabBarIcon: ({ color, size }) => <Apple color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="weight"
        options={{ title: t('Weight'), tabBarIcon: ({ color, size }) => <Scale color={color} size={size} /> }}
      />
      {/* Settings lives off the footer now — reached via the avatar in the Home header.
          href:null keeps /settings routable while hiding it from the tab bar. */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  )
}
