"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface McqOptionRow {
  key: string
  text: string
}

interface McqOptionsEditorProps {
  options: McqOptionRow[]
  correctKey: string
  onOptionsChange: (options: McqOptionRow[]) => void
  onCorrectChange: (key: string) => void
}

function nextOptionKey(options: McqOptionRow[]): string {
  const used = new Set(options.map((o) => o.key))
  for (let i = 0; i < 26; i++) {
    const key = String.fromCharCode(65 + i)
    if (!used.has(key)) return key
  }
  return `O${options.length + 1}`
}

export function McqOptionsEditor({
  options,
  correctKey,
  onOptionsChange,
  onCorrectChange,
}: McqOptionsEditorProps) {
  function updateOption(index: number, patch: Partial<McqOptionRow>) {
    onOptionsChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    const removed = options[index]
    const next = options.filter((_, i) => i !== index)
    onOptionsChange(next)
    if (correctKey === removed.key && next[0]) {
      onCorrectChange(next[0].key)
    }
  }

  function addOption() {
    const key = nextOptionKey(options)
    onOptionsChange([...options, { key, text: "" }])
  }

  return (
    <div className="space-y-3">
      <Label>Answer options</Label>
      {options.map((opt, index) => (
        <div key={opt.key} className="flex items-start gap-2 rounded-lg border p-3">
          <div className="flex flex-col items-center gap-1 pt-2">
            <Checkbox
              checked={correctKey === opt.key}
              onCheckedChange={() => onCorrectChange(opt.key)}
              aria-label={`Mark ${opt.key} as correct`}
            />
            <span className="text-xs font-medium text-muted-foreground">{opt.key}</span>
          </div>
          <Input
            className="flex-1"
            placeholder={`Option ${opt.key}`}
            value={opt.text}
            onChange={(e) => updateOption(index, { text: e.target.value })}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={options.length <= 2}
            onClick={() => removeOption(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addOption}>
        <Plus className="mr-1 h-4 w-4" />
        Add option
      </Button>
      <p className="text-xs text-muted-foreground">
        Check the box next to the correct answer.
      </p>
    </div>
  )
}

export const defaultMcqOptions: McqOptionRow[] = [
  { key: "A", text: "" },
  { key: "B", text: "" },
]
