/**
 * ✅ VALIDATION HELPERS
 * Reusable validation utilities for forms across the application
 * These helpers provide consistent validation logic and user-friendly error messages
 */

// ============================================
// 🔹 TEXT FIELD VALIDATORS
// ============================================

/**
 * Count words in a string
 * @param {string} text - The text to count words in
 * @returns {number} Number of words
 */
export const countWords = (text) => {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Validate title field (max 10 words)
 * @param {string} value - The title to validate
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateTitle = (value) => {
  if (!value || !value.trim()) {
    return "Title is required";
  }
  if (value.trim().length < 2) {
    return "Title must be at least 2 characters";
  }
  const wordCount = countWords(value);
  if (wordCount > 10) {
    return `Title cannot exceed 10 words (${wordCount} words)`;
  }
  return undefined;
};

/**
 * Validate description field (max 50 words)
 * @param {string} value - The description to validate
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateDescription = (value) => {
  if (!value || !value.trim()) {
    return "Description is required";
  }
  if (value.trim().length < 5) {
    return "Description must be at least 5 characters";
  }
  const wordCount = countWords(value);
  if (wordCount > 50) {
    return `Description cannot exceed 50 words (${wordCount} words)`;
  }
  return undefined;
};

/**
 * Generic required text field validator
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return undefined;
};

/**
 * Validate text length
 * @param {string} value - The value to validate
 * @param {number} maxLength - Maximum length allowed
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateTextLength = (value, maxLength, fieldName = "This field") => {
  if (!value) return undefined;
  if (value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters (${value.length}/${maxLength})`;
  }
  return undefined;
};

/**
 * Validate word count
 * @param {string} value - The value to validate
 * @param {number} maxWords - Maximum words allowed
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateWordCount = (value, maxWords, fieldName = "This field") => {
  if (!value || !value.trim()) return undefined;
  const wordCount = countWords(value);
  if (wordCount > maxWords) {
    return `${fieldName} cannot exceed ${maxWords} words (${wordCount} words)`;
  }
  return undefined;
};

/**
 * Validate email format
 * @param {string} value - The email to validate
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Invalid email format";
  }
  return undefined;
};

// ============================================
// 🔹 NUMBER FIELD VALIDATORS
// ============================================

/**
 * Validate that a value is a valid positive number
 * @param {number|string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validatePositiveNumber = (value, fieldName = "This field") => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }
  return undefined;
};

/**
 * Validate that a value is a valid non-negative number
 * @param {number|string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateNonNegativeNumber = (value, fieldName = "This field") => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }
  return undefined;
};

/**
 * Validate number range
 * @param {number|string} value - The value to validate
 * @param {number} min - Minimum value allowed
 * @param {number} max - Maximum value allowed
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateNumberRange = (value, min, max, fieldName = "This field") => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  if (numValue < min || numValue > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return undefined;
};

// ============================================
// 🔹 GENERAL UTILITY VALIDATORS
// ============================================

/**
 * Trim whitespace from a value
 * @param {string} value - The value to trim
 * @returns {string} Trimmed value
 */
export const trimValue = (value) => {
  return typeof value === "string" ? value.trim() : value;
};

/**
 * Normalize whitespace (remove extra spaces)
 * @param {string} value - The value to normalize
 * @returns {string} Normalized value
 */
export const normalizeWhitespace = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/\s+/g, " ");
};

/**
 * Validate select/dropdown field
 * @param {string} value - The selected value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateSelect = (value, fieldName = "This field") => {
  if (!value || value === "" || value === "0") {
    return `Please select a ${fieldName}`;
  }
  return undefined;
};

/**
 * Validate file attachment
 * @param {File} file - The file to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateFile = (file, allowedTypes = ["image/jpeg", "image/png", "image/gif"], maxSizeMB = 5) => {
  if (!file) {
    return "File is required";
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size cannot exceed ${maxSizeMB}MB`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `Only these file types are allowed: ${allowedTypes.join(", ")}`;
  }
  
  return undefined;
};

/**
 * Validate date field
 * @param {string} value - The date value (YYYY-MM-DD)
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateDate = (value, fieldName = "Date") => {
  if (!value) {
    return `${fieldName} is required`;
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return `${fieldName} format must be YYYY-MM-DD`;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} is not a valid date`;
  }
  return undefined;
};

/**
 * Validate time field
 * @param {string} value - The time value (HH:MM)
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateTime = (value, fieldName = "Time") => {
  if (!value) {
    return `${fieldName} is required`;
  }
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(value)) {
    return `${fieldName} format must be HH:MM (24-hour)`;
  }
  return undefined;
};

/**
 * Validate that endTime is after startTime
 * @param {string} startTime - Start time (HH:MM format)
 * @param {string} endTime - End time (HH:MM format)
 * @returns {string|undefined} Error message or undefined if valid
 */
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return undefined;
  
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  if (end <= start) {
    return "End time must be after start time";
  }
  return undefined;
};

// ============================================
// 🔹 BATCH VALIDATION
// ============================================

/**
 * Validate multiple fields at once
 * @param {Object} formData - Object containing form field values
 * @param {Object} rules - Validation rules object
 * @returns {Object} Object containing error messages
 * 
 * Example:
 * const errors = validateForm(formData, {
 *   title: (val) => validateTitle(val),
 *   description: (val) => validateDescription(val),
 * });
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(formData[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};

const validationHelpers = {
  countWords,
  validateTitle,
  validateDescription,
  validateRequired,
  validateTextLength,
  validateWordCount,
  validateEmail,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateNumberRange,
  trimValue,
  normalizeWhitespace,
  validateSelect,
  validateFile,
  validateDate,
  validateTime,
  validateTimeRange,
  validateForm,
};

export default validationHelpers;
