import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth/rbac"
import { apiResponse } from "@/lib/api/response"
import * as XLSX from "xlsx"
import {
  importProductsFromExcel,
  validateExcelData,
  type ExcelRow,
  type ExcelRowWithSection,
} from "@/lib/import/excel-importer"

export async function POST(request: NextRequest) {
  try {
    // Only admins can import data
    const { profile } = await requireAdmin()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const defaultStatus = (formData.get("status") as "draft" | "active") || "draft"
    const skipDuplicates = formData.get("skipDuplicates") === "true"
    const createSellers = formData.get("createSellers") === "true"

    if (!file) {
      return apiResponse.error("No file provided", 400)
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    const allRows: ExcelRowWithSection[] = []
    const validSections = ["Q1", "Q2", "Q3", "Q4"]

    for (const sheetName of workbook.SheetNames) {
      // Only process sheets that match section names (Q1, Q2, Q3, Q4)
      if (!validSections.includes(sheetName.toUpperCase())) {
        console.log(`[v0] Skipping sheet: ${sheetName}`)
        continue
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

      console.log(`[v0] Processing sheet ${sheetName}: ${jsonData.length} rows`)
      if (jsonData.length > 0) {
        console.log(`[v0] Columns in ${sheetName}:`, Object.keys(jsonData[0]))
      }

      // Validate data structure
      const validation = validateExcelData(jsonData)
      if (!validation.valid) {
        return apiResponse.error(`Invalid format in sheet "${sheetName}"`, 400, {
          errors: validation.errors,
          sheetName,
          foundColumns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
          expectedColumns: ["Brand", "Model", "Category", "Owner", "Date Of Purchase", "Paid"],
        })
      }

      // Add section information from sheet name
      const rowsWithSection: ExcelRowWithSection[] = jsonData.map((row) => ({
        ...row,
        Section: sheetName.toUpperCase(), // Use sheet name as section
      }))

      allRows.push(...rowsWithSection)
    }

    if (allRows.length === 0) {
      return apiResponse.error("No valid data found in sheets Q1, Q2, Q3, or Q4", 400)
    }

    console.log(`[v0] Total rows to import: ${allRows.length}`)

    // Import products
    const result = await importProductsFromExcel(allRows, {
      defaultStatus,
      skipDuplicates,
      createSellers,
    })

    console.log(
      `[v0] Import completed - Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors?.length || 0}`,
    )
    if (result.errors && result.errors.length > 0) {
      console.log(`[v0] First 10 errors:`, result.errors.slice(0, 10))
    }

    return apiResponse.success("Import completed", result)
  } catch (error) {
    console.error("[v0] Excel import error:", error)
    return apiResponse.error(error instanceof Error ? error.message : "Import failed", 500)
  }
}
