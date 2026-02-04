import { LegalSection as LegalSectionType } from "../model/support.types"

interface LegalSectionProps {
  section: LegalSectionType
}

export function LegalSection({ section }: LegalSectionProps) {
  return (
    <section id={section.id} className="mb-8 scroll-mt-20">
      <h2 className="text-foreground mb-3 text-lg font-semibold">{section.title}</h2>

      {/* Main content */}
      {Array.isArray(section.content) ? (
        section.content.map((paragraph, index) => (
          <p key={index} className="text-muted-foreground mb-2">
            {paragraph}
          </p>
        ))
      ) : (
        section.content && <p className="text-muted-foreground mb-2">{section.content}</p>
      )}

      {/* Subsections */}
      {section.subsections?.map((subsection) => (
        <div key={subsection.id} className="mt-4 ml-4">
          {subsection.title && <h3 className="text-foreground mb-2 text-base font-medium">{subsection.title}</h3>}
          {subsection.content && <p className="text-muted-foreground mb-2">{subsection.content}</p>}
          {subsection.items && subsection.items.length > 0 && (
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              {subsection.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  )
}
