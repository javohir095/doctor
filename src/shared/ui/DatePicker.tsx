import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toDateInputValue } from "@/shared/lib/date"

/** Drop-in replacement for a native `<input type="date">` — same "yyyy-MM-dd"
 * string contract in and out (so it plugs straight into react-hook-form
 * fields and plain useState alike), but opens the shared shadcn/react-day-picker
 * Calendar in a popover instead of the browser's inconsistent native picker. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Sanani tanlang",
  disabled,
  className,
  fromYear,
  toYear,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromYear?: number
  toYear?: number
}) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {selected ? format(selected, "dd.MM.yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(toDateInputValue(date))}
          autoFocus
          captionLayout={fromYear || toYear ? "dropdown" : "label"}
          startMonth={fromYear ? new Date(fromYear, 0) : undefined}
          endMonth={toYear ? new Date(toYear, 11) : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}
