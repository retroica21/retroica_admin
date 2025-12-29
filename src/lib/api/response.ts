import { NextResponse } from "next/server"
import type { ApiResponse } from "./types"

/**
 * Standardized API response helpers
 */

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status },
  )
}

export function errorResponse(error: string, status = 400, data?: any): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(data && { data }),
    },
    { status },
  )
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = "Forbidden"): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = "Not found"): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

export function serverErrorResponse(message = "Internal server error"): NextResponse<ApiResponse> {
  return errorResponse(message, 500)
}

export const apiResponse = {
  success: successResponse,
  error: errorResponse,
  unauthorized: unauthorizedResponse,
  forbidden: forbiddenResponse,
  notFound: notFoundResponse,
  serverError: serverErrorResponse,
}
