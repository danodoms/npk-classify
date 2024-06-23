import { Link, Tabs } from 'expo-router'
import { Button, useTheme } from 'tamagui'
import { Home, History, Scan } from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Button mr="$4" bg="$purple8" color="$purple12">
                Hello!
              </Button>
            </Link>
          ),
        }}
      />


      <Tabs.Screen
        name="Classify"
        options={{
          title: 'Detect',
          tabBarIcon: ({ color }) => <Scan color={color} />,
        }}
      />


      <Tabs.Screen
        name="Results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => <History color={color} />,
        }}
      />
    </Tabs>
  )
}
