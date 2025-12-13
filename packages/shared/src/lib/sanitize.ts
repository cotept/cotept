import type { Config as DOMPurifyConfig } from "dompurify"
import DOMPurify from "isomorphic-dompurify"

/**
 * 허용할 태그 (TipTap 기본 서식 + 헤딩)
 */
export const SANITIZE_ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
] as const

/**
 * 허용할 속성 (글로벌 + a 태그)
 */
export const SANITIZE_ALLOWED_ATTR = [
  "class",
  "title",
  "aria-label",
  "aria-live",
  "role",
  "href",
  "target",
  "rel",
] as const

/**
 * 금지할 태그
 */
export const SANITIZE_FORBIDDEN_TAGS = ["style", "script", "iframe", "object", "embed", "form", "input", "textarea"]

/**
 * 금지할 속성 패턴
 */
export const SANITIZE_FORBIDDEN_ATTR = [
  "style",
  "onerror",
  "onload",
  "onclick",
  "onmouseover",
  "onfocus",
  "onmouseenter",
]

/**
 * 공통으로 사용할 기본 옵션
 */
export const DEFAULT_SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [...SANITIZE_ALLOWED_TAGS],
  ALLOWED_ATTR: [...SANITIZE_ALLOWED_ATTR],
  FORBID_TAGS: [...SANITIZE_FORBIDDEN_TAGS],
  FORBID_ATTR: [...SANITIZE_FORBIDDEN_ATTR],
  ADD_ATTR: ["target", "rel"],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM: false,
  RETURN_TRUSTED_TYPE: false,
}

type SanitizeConfig = DOMPurifyConfig

const purifier = DOMPurify
let hooksRegistered = false

function registerHooks() {
  if (hooksRegistered) return

  purifier.addHook("afterSanitizeAttributes", (currentNode) => {
    if (!isSafeElement(currentNode)) return

    if (currentNode.tagName.toLowerCase() === "a") {
      const href = currentNode.getAttribute("href") ?? ""

      if (href.trim().startsWith("javascript:")) {
        currentNode.removeAttribute("href")
      }

      if (href) {
        currentNode.setAttribute("target", "_blank")
        currentNode.setAttribute("rel", "noopener noreferrer")
      } else {
        currentNode.removeAttribute("target")
        currentNode.removeAttribute("rel")
      }
    }
  })

  hooksRegistered = true
}

function isSafeElement(node: unknown): node is Element {
  return typeof node === "object" && node !== null && "tagName" in node
}

registerHooks()

/**
 * HTML 문자열을 안전하게 정제
 */
export function sanitizeHtml(input: string | null | undefined, config?: SanitizeConfig): string {
  if (!input) return ""
  const merged: SanitizeConfig = { ...DEFAULT_SANITIZE_CONFIG, ...config }
  return purifier.sanitize(input, merged) as string
}

/**
 * HTML을 정제한 뒤 순수 텍스트만 추출
 */
export function sanitizeToPlainText(input: string | null | undefined, config?: SanitizeConfig): string {
  const safeHtml = sanitizeHtml(input, config)
  return safeHtml
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export type { SanitizeConfig }
