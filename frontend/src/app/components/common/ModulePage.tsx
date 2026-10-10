import { Card } from "../ui/card";

type ModulePageProps = {
  title: string;
  description: string;
  status?: string;
};

export function ModulePage({ title, description, status = "Estructura lista" }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">ODAM · Módulo</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{title}</h1>
        <p className="text-gray-500 mt-2">{description}</p>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{status}</p>
            <p className="text-sm text-gray-500 mt-1">
              La pantalla queda separada por dominio para integrar el diseño Figma y la API Spring Boot sin mezclar responsabilidades.
            </p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            ODAM
          </span>
        </div>
      </Card>
    </div>
  );
}
