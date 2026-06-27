import { DocumentModuleClient } from "@/components/erp/document-module-client";
import { documentModules } from "@/lib/document-modules";

export default function ClientOutreachPage() {
  return <DocumentModuleClient module={documentModules.outreach} />;
}
