import { useEffect, type ReactNode } from "react";
import { StoreProvider } from "./lib/store";
import { navigate, useRoute } from "./lib/router";
import KycFlow from "./pages/member/KycFlow";
import AdminApp from "./pages/admin/AdminApp";
import PrintView from "./pages/print/PrintView";

function NavigateStub({ to }: { to: string }) {
  useEffect(() => {
    navigate(to);
  }, [to]);
  return null;
}

function Routes() {
  const route = useRoute();
  const parts = route.split("/").filter(Boolean);

  let page: ReactNode;
  if (parts[0] === "kyc" && parts[1]) {
    page = <KycFlow key={parts[1].toUpperCase()} code={parts[1].toUpperCase()} />;
  } else if (parts[0] === "admin") {
    page = <AdminApp section={parts[1] ?? "dashboard"} id={parts[2]} />;
  } else if (parts[0] === "print" && parts[1]) {
    page = <PrintView id={parts[1]} />;
  } else {
    return <NavigateStub to="/admin" />;
  }

  return <div className="min-h-dvh bg-slate-100">{page}</div>;
}

export default function App() {
  return (
    <StoreProvider>
      <Routes />
    </StoreProvider>
  );
}
