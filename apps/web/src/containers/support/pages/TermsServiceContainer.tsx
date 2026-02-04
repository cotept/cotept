import { LegalDocument } from "@/features/support/components/LegalDocument"
import { TERMS_SERVICE_DATA } from "@/features/support/model/terms-service.data"

export function TermsServiceContainer() {
  return <LegalDocument document={TERMS_SERVICE_DATA} />
}
