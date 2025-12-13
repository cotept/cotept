"use client"

import { Button } from "@repo/shared/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/shared/components/command"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/shared/components/popover"
import { cn } from "@repo/shared/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"

export type ComboBoxOption = { value: string; label: string; disabled?: boolean }

interface ComboBoxProps {
  options: ComboBoxOption[]
  value?: string
  onChange?: (next: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  buttonClassName?: string
  popoverClassName?: string
  searchable?: boolean
  disabled?: boolean
}

/**
 * Generic combobox component built on top of shadcn/ui primitives.
 * Pass `options` + `value/onChange` to control selection.
 */
export function ComboBox({
  options,
  value,
  onChange,
  placeholder = "검색어를 입력하세요.",
  searchPlaceholder = "검색어를 입력하세요.",
  emptyText = "검색 결과가 없습니다.",
  className,
  buttonClassName,
  popoverClassName,
  searchable = true,
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => options.find((option) => option.value === value), [options, value])

  const handleSelect = (nextValue: string) => {
    if (disabled) return
    const shouldClear = nextValue === value
    onChange?.(shouldClear ? undefined : nextValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}>
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[240px] p-0", popoverClassName)}>
        <Command className={className}>
          {searchable && <CommandInput placeholder={searchPlaceholder} className="h-9" />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={(currentValue) => handleSelect(currentValue)}>
                  {option.label}
                  <Check className={cn("ml-auto", value === option.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
