import { DocumentModuleClient } from "@/components/erp/document-module-client";
import { documentModules } from "@/lib/document-modules";

export default function ServicePackagesPage() {
  return <DocumentModuleClient module={documentModules.packages} />;
}
