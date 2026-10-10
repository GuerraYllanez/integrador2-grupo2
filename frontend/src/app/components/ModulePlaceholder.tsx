import { Card } from "./ui/card";
export function ModulePlaceholder({title,description}:{title:string;description:string}){return <div><h1>{title}</h1><p className="text-gray-500 mb-6">{description}</p><Card className="p-6"><p className="text-gray-600">Módulo conectado a la API Spring Boot de ODAM. Aquí se integrarán las operaciones reales sobre MySQL.</p></Card></div>}
