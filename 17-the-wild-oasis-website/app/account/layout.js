import SideNavigation from "@/app/_components/SideNavigation";
import ProtectedRoute from "@/app/_components/ProtectedRoute";

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <div className="grid grid-cols-[16rem_1fr] h-full gap-12">
        <SideNavigation />
        <div className="py-1">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
