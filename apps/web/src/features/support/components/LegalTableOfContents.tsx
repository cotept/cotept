"use client"

import Link from "next/link"

import { LegalSection } from "../model/support.types"

interface LegalTableOfContentsProps {
  sections: LegalSection[]
}

export function LegalTableOfContents({ sections }: LegalTableOfContentsProps) {
  return (
    <nav className="border-border bg-muted/30 mb-8 rounded-lg border p-4">
      <h2 className="text-foreground mb-3 text-sm font-semibold">목차</h2>
      <ul className="space-y-1 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <Link href={`#${section.id}`} className="text-muted-foreground hover:text-primary transition-colors">
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
