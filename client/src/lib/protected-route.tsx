import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ReactNode } from "react";

export function ProtectedRoute({
  path,
  children,
  component: Component,
}: {
  path: string;
  children?: ReactNode;
  component?: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-[#f2efe2]">
          <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (Component) {
    return <Route path={path} component={Component} />;
  }

  return <Route path={path}>{children}</Route>;
}
