/**
 * ✅ YUP VALIDATION SCHEMAS
 * Centralized validation schemas for all forms using Yup + Formik
 * These schemas ensure consistent validation across the entire application
 */

import * as yup from "yup";
import { countWords } from "./validationHelpers";

// ============================================
// 🔹 CUSTOM YUP VALIDATORS
// ============================================

/**
 * Custom Yup method to validate word count
 */
yup.addMethod(yup.string, "maxWords", function (maxWords, message) {
  return this.test("maxWords", message || `Cannot exceed ${maxWords} words`, function (value) {
    const { path, createError } = this;
    if (!value) return true; // Allow empty (handled by required())
    
    const wordCount = countWords(value);
    if (wordCount > maxWords) {
      return createError({
        path,
        message: message || `Cannot exceed ${maxWords} words (${wordCount} words)`,
      });
    }
    return true;
  });
});

/**
 * Custom Yup method to validate positive numbers
 */
yup.addMethod(yup.number, "positive", function (message) {
  return this.test("positive", message || "Must be a positive number", function (value) {
    const { path, createError } = this;
    if (value == null) return true; // Allow empty (handled by required())
    
    if (value < 0) {
      return createError({
        path,
        message: message || "Cannot be negative",
      });
    }
    return true;
  });
});

// ============================================
// 🔹 FIELD-LEVEL VALIDATORS
// ============================================

/**
 * Title field schema (10 words max, required, trimmed)
 */
const titleField = yup
  .string()
  .required("Title is required")
  .min(2, "Title must be at least 2 characters")
  .max(100, "Title cannot exceed 100 characters")
  .transform((value) => value?.trim?.() || "")
  .typeError("Title must be text")
  .maxWords(10, "Title cannot exceed 10 words");

/**
 * Description field schema (50 words max, required, trimmed)
 */
const descriptionField = yup
  .string()
  .required("Description is required")
  .min(5, "Description must be at least 5 characters")
  .max(500, "Description cannot exceed 500 characters")
  .transform((value) => value?.trim?.() || "")
  .typeError("Description must be text")
  .maxWords(50, "Description cannot exceed 50 words");

/**
 * Optional description field (50 words max, not required)
 */
const descriptionFieldOptional = yup
  .string()
  .max(500, "Description cannot exceed 500 characters")
  .transform((value) => value?.trim?.() || "")
  .typeError("Description must be text")
  .maxWords(50, "Description cannot exceed 50 words");

/**
 * Email field schema
 */
const emailField = yup
  .string()
  .required("Email is required")
  .email("Invalid email format")
  .trim();

/**
 * Required select/dropdown field
 */
const selectField = yup
  .string()
  .required("Please select an option")
  .notOneOf(["", "0"], "Please select a valid option");

/**
 * Required number field (non-negative)
 */
const numberField = yup
  .number()
  .required("This field is required")
  .typeError("Must be a valid number")
  .positive("Cannot be negative");

/**
 * Optional number field (non-negative)
 */
const numberFieldOptional = yup
  .number()
  .nullable()
  .typeError("Must be a valid number")
  .positive("Cannot be negative");

/**
 * Required date field
 */
const dateField = yup
  .string()
  .required("Date is required")
  .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .typeError("Must be a valid date");

/**
 * Required time field
 */
const timeField = yup
  .string()
  .required("Time is required")
  .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format");

/**
 * File field schema
 */
const fileField = yup
  .mixed()
  .required("File is required")
  .test("fileType", "Only image files are allowed", (value) => {
    if (!value) return true;
    if (value instanceof File) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      return allowedTypes.includes(value.type);
    }
    return false;
  })
  .test("fileSize", "File size cannot exceed 5MB", (value) => {
    if (!value) return true;
    if (value instanceof File) {
      return value.size <= 5 * 1024 * 1024;
    }
    return false;
  });

// ============================================
// 🔹 FORM-LEVEL SCHEMAS
// ============================================

/**
 * Report Incident Form Schema
 */
export const reportIncidentSchema = yup.object().shape({
  title: titleField,
  description: descriptionField,
  resourceId: selectField.required("Resource is required"),
  priority: selectField.required("Priority is required"),
  category: selectField.required("Category is required"),
});

/**
 * Availability Form Schema
 */
export const availabilitySchema = yup.object().shape({
  resourceId: selectField.required("Resource is required"),
  date: dateField,
  startTime: timeField,
  endTime: timeField,
}).test("endTimeAfterStart", "End time must be after start time", function (values) {
  if (!values.startTime || !values.endTime) return true;
  
  const start = new Date(`2000-01-01 ${values.startTime}`);
  const end = new Date(`2000-01-01 ${values.endTime}`);
  
  if (end <= start) {
    return this.createError({
      path: "endTime",
      message: "End time must be after start time",
    });
  }
  return true;
});

/**
 * Booking Form Schema
 */
export const bookingSchema = yup.object().shape({
  resourceId: selectField.required("Resource is required"),
  date: dateField,
  startTime: timeField,
  endTime: timeField,
  bookedBy: yup.string().required("Name is required").trim(),
  userId: selectField.required("User is required"),
}).test("endTimeAfterStart", "End time must be after start time", function (values) {
  if (!values.startTime || !values.endTime) return true;
  
  const start = new Date(`2000-01-01 ${values.startTime}`);
  const end = new Date(`2000-01-01 ${values.endTime}`);
  
  if (end <= start) {
    return this.createError({
      path: "endTime",
      message: "End time must be after start time",
    });
  }
  return true;
});

/**
 * Resource Form Schema
 */
export const resourceSchema = yup.object().shape({
  name: titleField.required("Resource name is required"),
  description: descriptionFieldOptional,
  location: yup.string().required("Location is required").trim(),
  capacity: numberField.required("Capacity is required").positive("Capacity must be greater than 0"),
  type: selectField.required("Type is required"),
});

/**
 * Login Form Schema
 */
export const loginSchema = yup.object().shape({
  email: emailField,
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * User Profile Form Schema
 */
export const userProfileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: emailField,
  phone: yup
    .string()
    .nullable()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number format"),
});

/**
 * Generic form schema builder
 * Allows creating custom schemas by combining field validators
 * 
 * @param {Object} fields - Object mapping field names to validators
 * @returns {yup.ObjectSchema} Yup schema object
 * 
 * Example:
 * const customSchema = createFormSchema({
 *   title: titleField,
 *   description: descriptionField,
 *   priority: selectField,
 * });
 */
export const createFormSchema = (fields) => {
  return yup.object().shape(fields);
};

// ============================================
// 🔹 EXPORT FIELD VALIDATORS
// ============================================

export const validators = {
  title: titleField,
  description: descriptionField,
  descriptionOptional: descriptionFieldOptional,
  email: emailField,
  select: selectField,
  number: numberField,
  numberOptional: numberFieldOptional,
  date: dateField,
  time: timeField,
  file: fileField,
};

export default {
  reportIncidentSchema,
  availabilitySchema,
  bookingSchema,
  resourceSchema,
  loginSchema,
  userProfileSchema,
  createFormSchema,
  validators,
};
