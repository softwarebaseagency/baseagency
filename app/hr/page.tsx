import { DocumentModuleClient } from "@/components/erp/document-module-client";
import { documentModules } from "@/lib/document-modules";

export default function HrPage() {
  return <DocumentModuleClient module={documentModules.hr} />;
}
