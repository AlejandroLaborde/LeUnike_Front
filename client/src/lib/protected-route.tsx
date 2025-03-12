import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { ReactNode } from "react";

// Updated ProtectedRoute to work without requiring a path
export function ProtectedRoute({
  path,
  children,
  component: Component,
}: {
  path?: string;
  children?: ReactNode;
  component?: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2efe2]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If we have a component, render it
  if (Component) {
    return <Component />;
  }

  // Otherwise, render children
  return <>{children}</>;
}
