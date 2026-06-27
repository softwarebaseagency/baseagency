import { DocumentModuleClient } from "@/components/erp/document-module-client";
import { documentModules } from "@/lib/document-modules";

export default function ManagementPage() {
  return <DocumentModuleClient module={documentModules.management} />;
}
