# Excel Import Guide

This guide explains how to import your existing inventory from Excel into the Retroica Admin database.

## Prerequisites

Before importing, you need to:

1. **Run the database schema scripts** - These have been automatically executed in your Supabase database

2. **Create seller accounts** for each owner listed in your Excel file:
   - Go to `/auth/signup` to create accounts
   - Use the owner names from your Excel sheet as the "Full Name"
   - Each seller will receive a confirmation email

3. **Make yourself an admin**:
   - Go to `/admin/setup`
   - Click "Upgrade to Admin"
   - Refresh the page

## Excel File Format

Your Excel file should be structured with **separate sheets for each quarter**:

### Sheet Structure

Create four sheets named exactly:
- **Q1** - First quarter inventory
- **Q2** - Second quarter inventory
- **Q3** - Third quarter inventory
- **Q4** - Fourth quarter inventory

### Required Columns (in each sheet)

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Brand | Yes | Product brand/manufacturer | Sony, Panasonic, Sharp |
| Model | Yes | Product model number | WM-D6C, RQ-SX70 |
| Category | Yes | Product category | Walkman, Radio, TV |
| Owner | Yes | Seller name (must match profile) | John Doe |
| Date Of Purchase | Yes | Purchase date | 2024-01-15 |
| Paid | Yes | Amount paid for product | 150.00 |

### Example Excel Structure

**Sheet: Q1**
```
Brand     | Model    | Category | Owner     | Date Of Purchase | Paid
----------|----------|----------|-----------|------------------|------
Sony      | WM-D6C   | Walkman  | John Doe  | 2024-01-15      | 150.00
Panasonic | RQ-SX70  | Radio    | Jane Smith| 2024-01-20      | 85.50
```

**Sheet: Q2**
```
Brand     | Model    | Category | Owner     | Date Of Purchase | Paid
----------|----------|----------|-----------|------------------|------
Sharp     | GF-777   | Boombox  | John Doe  | 2024-04-10      | 200.00
Aiwa      | HS-T50   | Walkman  | Jane Smith| 2024-04-15      | 120.00
```

## Import Process

1. **Login as Admin**
   - Navigate to `/auth/login`
   - Use an account with admin role

2. **Access Import Page**
   - Go to `/admin/import` or click "Import" in the admin navigation

3. **Configure Import Options**
   - **Import Status**: Choose "Draft" (recommended) or "Active"
     - Draft: Products won't be visible on platforms until reviewed
     - Active: Products are immediately ready for platform listing
   - **Skip Duplicates**: Enabled by default to avoid duplicate entries

4. **Upload Excel File**
   - Click "Choose File" and select your .xlsx or .xls file
   - The importer will automatically process all Q1, Q2, Q3, and Q4 sheets
   - Click "Import Products"

5. **Review Results**
   - The import will show:
     - Number of products successfully imported (across all sheets)
     - Number of products skipped (duplicates)
     - Any errors encountered with row numbers

## Generated SKU Format

The system automatically generates SKUs for each product:

```
[BRAND-3-LETTERS]-[MODEL-4-CHARS]-[SECTION]-[TIMESTAMP]
```

Example: `SON-WMD6-Q1-123456`

## Data Mapping

Your Excel columns are mapped to the database as follows:

| Excel Column | Database Field | Location |
|--------------|----------------|----------|
| Sheet Name (Q1-Q4) | `metadata.section` | products.metadata |
| Brand | `metadata.brand` | products.metadata |
| Model | `metadata.model` | products.metadata |
| Category | `category` | products.category |
| Owner | `seller_id` | products.seller_id (via profile lookup) |
| Date Of Purchase | `metadata.date_of_purchase` | products.metadata |
| Paid | `cost` and `base_price` | products.cost, products.base_price |

The system also creates:
- `title`: Combination of Brand + Model
- `description`: Auto-generated with brand and model info
- `sku`: Auto-generated unique identifier
- `status`: Based on import option (draft/active)

## Common Issues

### "Seller not found" Error

**Problem**: The Owner name in Excel doesn't match any profile in the database.

**Solution**: 
1. Check the exact spelling of owner names
2. Create seller accounts with matching full names at `/auth/signup`
3. Re-run the import

### No Valid Data Found

**Problem**: Sheets are not named Q1, Q2, Q3, or Q4.

**Solution**: 
- Rename your Excel sheets to exactly match: Q1, Q2, Q3, Q4 (case-insensitive)
- The importer only processes sheets with these names

### Duplicate Products

**Problem**: Products already exist with the same SKU.

**Solution**: 
- Keep "Skip Duplicates" enabled to avoid errors
- Or manually delete existing products before re-importing

### Invalid Date Format

**Problem**: Date of Purchase column has unexpected format.

**Solution**: The importer supports:
- Excel date numbers
- ISO date strings (YYYY-MM-DD)
- Common date formats (MM/DD/YYYY, DD/MM/YYYY)

If dates aren't importing correctly, convert your Excel dates to YYYY-MM-DD format.

## Post-Import Steps

After successful import:

1. **Review Products**
   - Go to `/admin/products` to view all imported products
   - Check that all data mapped correctly
   - Verify sections are properly assigned (Q1-Q4)

2. **Add Images**
   - Products import without images
   - Edit individual products to add photos

3. **Set Pricing**
   - The `Paid` amount is used as both cost and base price
   - Adjust prices as needed for each sales platform

4. **List on Platforms**
   - Once reviewed, list products on Etsy, Medusa, Aukro
   - Use the platform sync features in `/admin/sync`

## API Endpoint

The import functionality is also available via API:

```bash
POST /api/import/excel
Content-Type: multipart/form-data

Parameters:
- file: Excel file (.xlsx or .xls)
- status: "draft" or "active" (default: "draft")
- skipDuplicates: "true" or "false" (default: "true")
- createSellers: "true" or "false" (default: "false")
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "imported": 45,
    "skipped": 3,
    "errors": []
  }
}
```

## Next Steps

After importing your inventory:

1. **Add Product Photos**: Bulk upload or individual editing
2. **Configure Platform Settings**: Set up API credentials for Etsy, Medusa, Aukro
3. **Setup Pricing Rules**: Create rules for platform-specific pricing
4. **Enable Platform Sync**: Start syncing with external platforms
5. **Train Sellers**: Show other sellers how to access their dashboard

## Support

If you encounter issues during import:
- Check the error messages for specific row numbers and sheet names
- Verify your Excel file has sheets named Q1, Q2, Q3, Q4
- Ensure all required columns are present in each sheet
- Ensure all seller accounts are created before importing
- Check that you have admin privileges at `/admin/setup`
