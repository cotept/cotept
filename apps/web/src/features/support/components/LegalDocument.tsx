"use client"

import { LegalDocument as LegalDocumentType } from "../model/support.types"

import { LegalSection } from "./LegalSection"
import { LegalTableOfContents } from "./LegalTableOfContents"

interface LegalDocumentProps {
  document: LegalDocumentType
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">{document.title}</h1>
        <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
          <span>시행일: {document.effectiveDate}</span>
          <span>최종 수정일: {document.lastUpdated}</span>
          <span>버전: {document.version}</span>
        </div>
      </header>

      {/* Table of Contents */}
      <LegalTableOfContents sections={document.sections} />

      {/* Content */}
      <article>
        {document.sections.map((section) => (
          <LegalSection key={section.id} section={section} />
        ))}
      </article>
    </div>
  )
}
