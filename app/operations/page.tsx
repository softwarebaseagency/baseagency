import { DocumentModuleClient } from "@/components/erp/document-module-client";
import { documentModules } from "@/lib/document-modules";

export default function OperationsPage() {
  return <DocumentModuleClient module={documentModules.operations} />;
}
