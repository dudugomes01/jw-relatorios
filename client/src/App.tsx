// import { Switch, Route, Redirect } from "wouter";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
// import { Toaster } from "@/components/ui/toaster";
// import NotFound from "@/pages/not-found";
// import HomePage from "@/pages/home-page";
// import SettingsPage from "@/pages/settings-page";
// import RemindersPage from "@/pages/reminders-page";
// import ReportsPage from "@/pages/reports-page";

// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={HomePage} />
//       <Route path="/settings" component={SettingsPage} />
//       <Route path="/lembretes" component={RemindersPage} />
//       <Route path="/reports" component={ReportsPage} />
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Router />
//       <Toaster />
//     </QueryClientProvider>
//   );
// }

// export default App;


// filepath: /Users/dudugomes/Documents/Workspace/jw-relatorios/client/src/App.tsx
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import SettingsPage from "@/pages/settings-page";
import RemindersPage from "@/pages/reminders-page";
import ReportsPage from "@/pages/reports-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Rota pública */}
      <Route path="/auth" component={AuthPage} />

      {/* Rotas protegidas */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/lembretes" component={RemindersPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />

      {/* Rota de fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;