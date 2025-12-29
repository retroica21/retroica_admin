import { createServerClient } from "@/lib/supabase/server"

export interface ExcelRow {
  Brand: string
  Model: string
  Category: string
  Owner: string
  "Date of Purchase": string | Date // Changed from "Date Of Purchase"
  Paid: number | string // This is the cost paid, can be empty
}

export interface ExcelRowWithSection extends ExcelRow {
  Section: string // Derived from sheet name (Q1, Q2, Q3, Q4)
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: Array<{ row: number; error: string }>
  skipped: number
}

export interface ImportOptions {
  defaultStatus?: "draft" | "active"
  skipDuplicates?: boolean
  createSellers?: boolean
}

/**
 * Import products from Excel data
 */
export async function importProductsFromExcel(
  rows: ExcelRowWithSection[],
  options: ImportOptions = {},
): Promise<ImportResult> {
  const { defaultStatus = "draft", skipDuplicates = true, createSellers = false } = options

  const supabase = await createServerClient()
  const result: ImportResult = {
    success: false,
    imported: 0,
    errors: [],
    skipped: 0,
  }

  // Step 1: Get or create sellers based on Owner names
  const ownerNames = [...new Set(rows.map((r) => r.Owner).filter(Boolean))]
  console.log(`[v0] Unique owners found: ${ownerNames.length}`, ownerNames)

  const sellerMap = new Map<string, string>() // Map owner name -> seller_id

  for (const ownerName of ownerNames) {
    // Check if profile exists with this name
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("full_name", ownerName)
      .single()

    console.log(
      `[v0] Looking for seller "${ownerName}":`,
      existingProfile ? `Found (${existingProfile.email})` : "Not found",
    )

    if (profileError) {
      console.log(`[v0] Profile lookup error for "${ownerName}":`, profileError.message)
    }

    if (existingProfile) {
      sellerMap.set(ownerName, existingProfile.id)
    } else if (createSellers) {
      result.errors.push({
        row: 0,
        error: `Seller "${ownerName}" not found. Please create seller account first.`,
      })
    } else {
      result.errors.push({
        row: 0,
        error: `Seller "${ownerName}" not found. Set createSellers: true to auto-create.`,
      })
    }
  }

  console.log(`[v0] Seller map created: ${sellerMap.size} sellers matched`)
  // Step 2: Import each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2 // Excel row (assuming header is row 1)

    try {
      // Validate required fields
      if (!row.Brand || !row.Model) {
        result.errors.push({
          row: rowNumber,
          error: "Missing required fields: Brand and Model",
        })
        result.skipped++
        continue
      }

      if (!row.Owner) {
        result.errors.push({
          row: rowNumber,
          error: "Missing Owner field",
        })
        result.skipped++
        continue
      }

      const sellerId = sellerMap.get(row.Owner)
      if (!sellerId) {
        result.errors.push({
          row: rowNumber,
          error: `Seller "${row.Owner}" not found in system`,
        })
        result.skipped++
        continue
      }

      // Generate SKU from brand, model, and section
      const sku = generateSKU(row.Brand, row.Model, row.Section)

      // Check for duplicates if enabled
      if (skipDuplicates) {
        const { data: existing } = await supabase.from("products").select("id").eq("sku", sku).single()

        if (existing) {
          result.skipped++
          continue
        }
      }

      const purchaseDate = parseDateField(row["Date of Purchase"])

      const costPaid = Number.parseFloat(String(row.Paid || 0)) || 0

      const basePrice = costPaid > 0 ? costPaid * 1.5 : 0

      // Prepare product data
      const productData = {
        seller_id: sellerId,
        title: `${row.Brand} ${row.Model}`,
        description: `${row.Category || "Camera"} - ${row.Brand} ${row.Model}`,
        category: row.Category || "Uncategorized",
        base_price: basePrice, // Calculated selling price
        cost: costPaid, // Actual cost paid
        sku,
        status: defaultStatus,
        metadata: {
          section: row.Section,
          brand: row.Brand,
          model: row.Model,
          date_of_purchase: purchaseDate?.toISOString(),
          imported_at: new Date().toISOString(),
        },
      }

      // Insert product
      const { error } = await supabase.from("products").insert(productData)

      if (error) {
        result.errors.push({
          row: rowNumber,
          error: `Database error: ${error.message}`,
        })
        result.skipped++
      } else {
        result.imported++
      }
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
      result.skipped++
    }
  }

  result.success = result.imported > 0
  return result
}

/**
 * Generate a unique SKU from brand, model, and section
 */
function generateSKU(brand: string, model: string, section: string): string {
  const brandCode = brand
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
  const modelCode = model
    .substring(0, 4)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
  const sectionCode = section.toUpperCase()
  const timestamp = Date.now().toString().slice(-6)

  return `${brandCode}-${modelCode}-${sectionCode}-${timestamp}`
}

/**
 * Parse various date formats from Excel
 */
function parseDateField(dateValue: string | Date | number): Date | null {
  if (!dateValue) return null

  // Already a Date object
  if (dateValue instanceof Date) {
    return dateValue
  }

  // Excel serial date number
  if (typeof dateValue === "number") {
    // Excel dates start from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1)
    const days = dateValue - 2 // Excel bug: treats 1900 as leap year
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
  }

  // String date - try to parse
  try {
    const parsed = new Date(dateValue)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  } catch {
    // Fall through to return null
  }

  return null
}

/**
 * Validate Excel data structure before import
 */
export function validateExcelData(rows: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!rows || rows.length === 0) {
    errors.push("No data found in Excel file")
    return { valid: false, errors }
  }

  const requiredColumns = ["Brand", "Model", "Category", "Owner"]
  const firstRow = rows[0]

  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push(`Missing required column: ${col}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
