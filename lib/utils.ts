import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateInput: string | number): string {
  if (!dateInput) return "Geen datum"

  try {
    // Check if the date input is valid
    let timestamp: number

    if (typeof dateInput === "number") {
      // If it's already a timestamp
      timestamp = dateInput
    } else {
      // If it's a string, parse it
      timestamp = Date.parse(dateInput)
    }

    if (isNaN(timestamp)) {
      console.warn(`Invalid date input: ${dateInput}`)
      return "Ongeldige datum"
    }

    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Ongeldige datum"
  }
}

// Helper function to check if a date string or timestamp is valid
export function isValidDate(dateInput: string | number): boolean {
  if (!dateInput) return false

  try {
    let timestamp: number

    if (typeof dateInput === "number") {
      // If it's already a timestamp
      timestamp = dateInput
    } else {
      // If it's a string, parse it
      timestamp = Date.parse(dateInput)
    }

    return !isNaN(timestamp)
  } catch (error) {
    return false
  }
}
