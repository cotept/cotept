import { LegalDocument } from "@/features/support/components/LegalDocument"
import { TERMS_PRIVACY_DATA } from "@/features/support/model/terms-privacy.data"

export function TermsPrivacyContainer() {
  return <LegalDocument document={TERMS_PRIVACY_DATA} />
}
