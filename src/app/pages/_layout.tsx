import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fontFamily, sidebar } from "@/theme";

/**
 * Bottom tab bar = the persistent control surface. Per the spec it stays the
 * always-dark "control panel" in both themes. 5 tabs max. Detail + lookup
 * screens live in this folder too but are hidden from the bar (href: null).
 */
export default function PagesLayout() {
  return (
    <Tabs
      // Detail/create screens live in this tab navigator (href: null). Without
      // "history", back() obeys the default "firstRoute" and jumps to the first
      // tab (Home) instead of the screen the user actually came from.
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: sidebar.primary,
        tabBarInactiveTintColor: sidebar.mutedForeground,
        tabBarStyle: {
          backgroundColor: sidebar.background,
          borderTopColor: sidebar.border,
          borderTopWidth: 1,
          height: 86,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.monoSemiBold,
          fontSize: 10,
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "HOME",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "speedometer" : "speedometer-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "JOBS",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "construct" : "construct-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspect"
        options={{
          title: "INSPECT",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "scan-circle" : "scan-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parts"
        options={{
          title: "PARTS",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "MORE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Auth gate — hidden from the bar AND hides the bar while focused. */}
      <Tabs.Screen name="auth" options={{ href: null, tabBarStyle: { display: "none" } }} />

      {/* Stack-style routes — reachable by navigation, hidden from the tab bar. */}
      <Tabs.Screen name="today" options={{ href: null }} />
      <Tabs.Screen name="appointment-detail" options={{ href: null }} />
      <Tabs.Screen name="inspection-create" options={{ href: null }} />
      <Tabs.Screen name="job-detail" options={{ href: null }} />
      <Tabs.Screen name="job-create" options={{ href: null }} />
      <Tabs.Screen name="requisition-detail" options={{ href: null }} />
      <Tabs.Screen name="requisition-create" options={{ href: null }} />
      <Tabs.Screen name="inspection-detail" options={{ href: null }} />
      <Tabs.Screen name="lookup" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
