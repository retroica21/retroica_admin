"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ImportResult {
  success: boolean
  imported: number
  errors?: Array<{ row: number; error: string }>
  skipped: number
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<"draft" | "active">("draft")
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("status", defaultStatus)
      formData.append("skipDuplicates", skipDuplicates.toString())
      formData.append("createSellers", "false")

      const response = await fetch("/api/import/excel", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Import failed")
      }

      setResult({
        ...data.data,
        errors: data.data.errors || [],
      })
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: [
          {
            row: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
        skipped: 0,
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Products from Excel</h1>
        <p className="text-muted-foreground mt-2">
          Upload your inventory Excel file to import products into the database
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Excel Format Requirements</CardTitle>
          <CardDescription>Your Excel file must be structured as follows:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong className="text-sm">Sheet Structure:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Each quarter should be a separate sheet named <strong>Q1</strong>, <strong>Q2</strong>,{" "}
                <strong>Q3</strong>, or <strong>Q4</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Required Columns:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Brand</li>
                  <li>Model</li>
                  <li>Owner (seller name)</li>
                </ul>
              </div>
              <div>
                <strong>Additional Columns:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Category</li>
                  <li>Date Of Purchase</li>
                  <li>Paid (amount)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>Select your .xlsx or .xls file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <div className="flex gap-4">
              <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={importing} />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Import Options</Label>
              <RadioGroup value={defaultStatus} onValueChange={(v) => setDefaultStatus(v as "draft" | "active")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="font-normal">
                    Import as Draft (recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="font-normal">
                    Import as Active
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipDuplicates"
                checked={skipDuplicates}
                onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
              />
              <Label htmlFor="skipDuplicates" className="font-normal">
                Skip duplicate products (based on SKU)
              </Label>
            </div>
          </div>

          <Button onClick={handleImport} disabled={!file || importing} className="w-full">
            {importing ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Import Completed
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Import Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{result.errors?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errors Encountered</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm">
                        {error.row > 0 && `Row ${error.row}: `}
                        {error.error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
