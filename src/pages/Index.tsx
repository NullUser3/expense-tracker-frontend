import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useAppSelector } from "../store/hooks";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const user = useAppSelector((state) => state.user.user);
  const isGuest = user?.role === "guest";
  const [showGuestAlert, setShowGuestAlert] = useState(true);

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center sm:ml-64">
        {/* Guest Notice Alert */}
        {isGuest && showGuestAlert && (
          <div className="border-b border-border bg-yellow-500/5 px-6 py-4 w-full 2xl:max-w-6xl">
            <Alert variant="warning" className="border-yellow-500/30 bg-yellow-500/10 relative">
              <button
                onClick={() => setShowGuestAlert(false)}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-yellow-500/20 transition-colors"
                aria-label="Close alert"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center h-full mb-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
              <AlertTitle>Using as Guest</AlertTitle>
              </div>
              <AlertDescription>
                You're browsing as a guest. Your data won't persist after you clear your browser data or log out. 
                <a 
                  href="/login" 
                  className="font-semibold underline ml-1 hover:opacity-80 hover:bg-accent2"
                >
                  Login now
                </a>
                {" "}to save your data permanently.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <main className="flex-1 p-6 bg-bg/5 overflow-auto w-full 2xl:max-w-6xl ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}