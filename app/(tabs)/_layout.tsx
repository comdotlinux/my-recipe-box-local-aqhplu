
import { Tabs } from 'expo-router';
import { colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom FAB component for the Add tab
function AddTabButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={{
        top: Platform.OS === 'ios' ? -10 : -20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
      onPress={onPress}
    >
      <Icon name="add" size={28} color={colors.background} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 12,
          height: Math.max(insets.bottom + 65, 75),
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: (props) => (
            <AddTabButton {...props} onPress={() => router.push('/(tabs)/add')} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
