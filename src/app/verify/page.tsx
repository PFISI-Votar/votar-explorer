import { VerifyForm } from "@/components/verify-form";

export const metadata = { title: "Verificar contrato" };

export default function VerifyPage() {
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Código fuente</p><h1>Verificar contrato</h1><p>Demostrá que el código publicado genera exactamente el bytecode desplegado.</p></div><section className="panel"><VerifyForm /></section></div>;
}
