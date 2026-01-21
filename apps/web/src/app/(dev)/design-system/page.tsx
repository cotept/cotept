"use client"

import React from "react"

import { useTheme } from "next-themes"

import { Button } from "@repo/shared/components/button"
import { cn } from "@repo/shared/lib/utils"

import { Moon, Sun } from "lucide-react"

import { useMounted } from "@/shared/hooks/useMounted"

function ColorSwatch({ name, variable, className }: { name: string; variable: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("border-border h-24 w-full rounded-xl border shadow-sm transition-all", className)} />
      <div className="space-y-1">
        <p className="text-foreground text-sm font-bold">{name}</p>
        <p className="text-muted-foreground font-mono text-xs">{variable}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-foreground border-border border-b pb-4 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) return null

  return (
    <div className="bg-background text-foreground min-h-screen p-8 transition-colors duration-300 md:p-16">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Header */}
        <header className="bg-background/80 border-border sticky top-0 z-50 flex items-center justify-between border-b py-4 backdrop-blur-md">
          <div className="space-y-2">
            <h1 className="text-primary text-4xl font-black">CotePT Design System v3</h1>
            <p className="text-muted-foreground">Semantic & Functional Color Palette (HEX Based)</p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full">
            {theme === "dark" ? (
              <>
                <Moon className="mr-2 h-5 w-5" /> Dark Mode
              </>
            ) : (
              <>
                <Sun className="mr-2 h-5 w-5" /> Light Mode
              </>
            )}
          </Button>
        </header>

        {/* 1. Brand & Functional Colors */}
        <Section title="1. Brand & Functional Colors">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Primary (Purple) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Primary (Brand Main)</h3>
              <div className="grid grid-cols-3 gap-2">
                <ColorSwatch name="Tint" variable="bg-primary-tint" className="bg-primary-tint" />
                <ColorSwatch name="Base" variable="bg-primary" className="bg-primary" />
                <ColorSwatch name="Shade" variable="bg-primary-shade" className="bg-primary-shade" />
              </div>
            </div>

            {/* Secondary (Pink) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Secondary (Brand Sub)</h3>
              <div className="grid grid-cols-3 gap-2">
                <ColorSwatch name="Tint" variable="bg-secondary-tint" className="bg-secondary-tint" />
                <ColorSwatch name="Base" variable="bg-secondary" className="bg-secondary" />
                <ColorSwatch name="Shade" variable="bg-secondary-shade" className="bg-secondary-shade" />
              </div>
            </div>

            {/* Tertiary (Blue) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Tertiary (Accent)</h3>
              <div className="grid grid-cols-3 gap-2">
                <ColorSwatch name="Tint" variable="bg-tertiary-tint" className="bg-tertiary-tint" />
                <ColorSwatch name="Base" variable="bg-tertiary" className="bg-tertiary" />
                <ColorSwatch name="Shade" variable="bg-tertiary-shade" className="bg-tertiary-shade" />
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Status Colors */}
        <Section title="2. Status Colors">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <ColorSwatch name="Success" variable="bg-success" className="bg-success" />
            <ColorSwatch name="Warning" variable="bg-warning" className="bg-warning" />
            <ColorSwatch name="Destructive" variable="bg-destructive" className="bg-destructive" />
            <ColorSwatch name="Info" variable="bg-info" className="bg-info" />
          </div>
        </Section>

        <Section title="3. Layered System (Zinc Levels)">
          <div className="space-y-12">
            {/* Background Layers */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                Background Layers (Depth)
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <ColorSwatch name="BG-1 (Base)" variable="bg-background" className="bg-background border" />
                <ColorSwatch name="BG-2 (Surface)" variable="bg-bg-2" className="bg-bg-2 border" />
                <ColorSwatch name="BG-3 (Muted/Card)" variable="bg-bg-3" className="bg-bg-3 border" />
                <ColorSwatch name="BG-4 (Input/Strong)" variable="bg-bg-4" className="bg-bg-4 border" />
                <ColorSwatch name="BG-5 (Hover)" variable="bg-bg-5" className="bg-bg-5 border" />
              </div>
            </div>

            {/* Text Layers */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                Text Layers (Importance)
              </h3>
              <div className="bg-bg-3/50 grid grid-cols-2 gap-6 rounded-xl border p-6 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-foreground text-2xl font-bold">Foreground 1</p>
                  <p className="text-fg-3 font-mono text-xs">text-foreground / Main Title</p>
                </div>
                <div className="space-y-2">
                  <p className="text-fg-2 text-xl font-semibold">Foreground 2</p>
                  <p className="text-fg-3 font-mono text-xs">text-fg-2 / Body Strong</p>
                </div>
                <div className="space-y-2">
                  <p className="text-fg-3 text-base">Foreground 3</p>
                  <p className="text-fg-3 font-mono text-xs">text-fg-3 / Description</p>
                </div>
                <div className="space-y-2">
                  <p className="text-fg-4 text-sm">Foreground 4</p>
                  <p className="text-fg-3 font-mono text-xs">text-fg-4 / Disabled</p>
                </div>
              </div>
            </div>

            {/* Border Layers */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                Border Layers (Strength)
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-background border-border-1 flex h-24 items-center justify-center rounded-xl border-2">
                  <p className="text-fg-3 font-mono text-sm">border-border-1 / Divider</p>
                </div>
                <div className="bg-background border-border-2 flex h-24 items-center justify-center rounded-xl border-2">
                  <p className="text-fg-3 font-mono text-sm">border-border-2 / Default</p>
                </div>
                <div className="bg-background border-border-3 flex h-24 items-center justify-center rounded-xl border-2">
                  <p className="text-fg-3 font-mono text-sm">border-border-3 / Strong</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Legacy Mapping Check */}
        <Section title="4. Legacy Mapping (Check Compatibility)">
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
              Functional Semantic Mapping
            </h3>
            <div className="border-border bg-muted/30 grid grid-cols-2 gap-6 rounded-xl border p-6 md:grid-cols-4">
              <ColorSwatch name="Background" variable="bg-background" className="bg-background border" />
              <ColorSwatch name="Card" variable="bg-card" className="bg-card border" />
              <ColorSwatch name="Popover" variable="bg-popover" className="bg-popover border" />
              <ColorSwatch name="Muted" variable="bg-muted" className="bg-muted border" />
              <ColorSwatch name="Accent" variable="bg-accent" className="bg-accent border" />
              <ColorSwatch name="Border" variable="bg-border" className="bg-border" />
              <ColorSwatch name="Input" variable="bg-input" className="bg-input" />
            </div>
          </div>
        </Section>

        {/* 5. Button Variants Check */}
        <Section title="5. Button Variants (Component Test)">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default (Primary)</Button>
            <Button variant="secondary">Secondary (Pink)</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>

            <div className="bg-border my-2 h-px w-full" />

            <p className="text-muted-foreground w-full text-sm font-semibold">Custom Auth Buttons</p>
            <Button variant="auth-primary">Auth Primary</Button>
            <Button variant="auth-secondary">Auth Secondary (Gray)</Button>
            <Button variant="auth-special">Auth Special (Gradient)</Button>
            <Button variant="cta-primary">Onboarding (Blue Gradient)</Button>
          </div>
        </Section>
      </div>
    </div>
  )
}
