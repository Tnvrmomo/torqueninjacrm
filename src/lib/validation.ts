import { z } from 'zod';

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const commonStringSchema = (fieldName: string, maxLength: number = 255) => 
  z.string()
    .trim()
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .transform(sanitizeString);

export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, "Email must be less than 255 characters")
  .or(z.literal(""));

export const urlSchema = z.string()
  .trim()
  .url({ message: "Invalid URL" })
  .max(500, "URL must be less than 500 characters")
  .optional()
  .or(z.literal(""));

export const textareaSchema = (maxLength: number = 1000) =>
  z.string()
    .trim()
    .max(maxLength, `Text must be less than ${maxLength} characters`)
    .optional()
    .or(z.literal(""));

export const phoneSchema = z.string()
  .trim()
  .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
  .max(20, "Phone number must be less than 20 characters")
  .optional()
  .or(z.literal(""));

export const numberSchema = (fieldName: string, min: number = 0) =>
  z.number()
    .min(min, `${fieldName} must be at least ${min}`)
    .or(z.string().transform((val) => parseFloat(val) || 0));
