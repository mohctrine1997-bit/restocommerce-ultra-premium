/**
 * Direction « Le Comptoir Éditorial » : une interface de commande gourmande,
 * structurée et légère, avec des parcours courts et une hiérarchie nette.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Marketplace} />
      <Route path="/restaurant/:slug" component={Home} />
      <Route path="/dashboard">
        <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f7f3eb] font-sans text-sm font-bold text-[#173f35]">Ouverture de l’espace restaurateur…</main>}>
          <Dashboard />
        </Suspense>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
