# 🎯 Form Validation Guide

## Overview

This documentation provides a comprehensive guide to the global form validation system used in the Faculty Management System. The validation system uses **Formik** (form state management) and **Yup** (validation schemas) to provide consistent, reusable, and scalable form validation across the entire frontend application.

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Core Concepts](#core-concepts)
3. [Validation Helpers](#validation-helpers)
4. [Yup Schemas](#yup-schemas)
5. [Implementation Examples](#implementation-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Installation

### Prerequisites
- Node.js 14+ installed
- React 16.8+ (for hooks support)

### Install Dependencies

```bash
npm install formik yup
```

This installs:
- **Formik**: Form state management library
- **Yup**: Schema validation library

### Import in Your Project

```javascript
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
```

---

## 💡 Core Concepts

### Validation Layers

Your validation system has three layers:

1. **Validation Helpers** (`validationHelpers.js`)
   - Low-level utility functions
   - Can be used standalone for custom validation
   - Examples: `countWords()`, `validateTitle()`, `trimValue()`

2. **Yup Schemas** (`validationSchemas.js`)
   - Declarative validation rules
   - Composable and reusable
   - Integration with Formik for real-time validation

3. **Formik Integration** (in components)
   - Form state management
   - Error display
   - Form submission handling

### Validation Flow

```
User Input → Formik → Yup Schema → Validation Helpers → Errors
   ↓
User sees error messages
   ↓
User corrects input → Re-validation
   ↓
All valid → Submit enabled
```

---

## 🛠️ Validation Helpers

### Text Field Validators

#### 1. `countWords(text)`
Count words in a string.

```javascript
import { countWords } from "../utils/validationHelpers";

countWords("Hello World Test"); // Returns: 3
countWords(""); // Returns: 0
```

#### 2. `validateTitle(value)`
Validate title field (max 10 words, required).

```javascript
import { validateTitle } from "../utils/validationHelpers";

validateTitle(""); // "Title is required"
validateTitle("A"); // "Title must be at least 2 characters"
validateTitle("This is a title with way too many words for the field limit"); 
// "Title cannot exceed 10 words (12 words)"
```

#### 3. `validateDescription(value)`
Validate description field (max 50 words, required).

```javascript
import { validateDescription } from "../utils/validationHelpers";

validateDescription(""); // "Description is required"
validateDescription("Short"); // OK (1 word)
validateDescription("...very long text..."); // "Description cannot exceed 50 words (75 words)"
```

#### 4. `validateWordCount(value, maxWords, fieldName)`
Generic word count validator for any field.

```javascript
import { validateWordCount } from "../utils/validationHelpers";

validateWordCount("Hello World", 5, "Custom Field"); // OK
validateWordCount("Hello World Test Extra Words", 3, "Custom Field"); 
// "Custom Field cannot exceed 3 words (5 words)"
```

#### 5. `validateTextLength(value, maxLength, fieldName)`
Validate character length.

```javascript
import { validateTextLength } from "../utils/validationHelpers";

validateTextLength("Hello World", 20, "Name"); // OK
validateTextLength("Hello World Extra", 10, "Name"); 
// "Name cannot exceed 10 characters (17/10)"
```

#### 6. `validateEmail(value)`
Validate email format.

```javascript
import { validateEmail } from "../utils/validationHelpers";

validateEmail(""); // "Email is required"
validateEmail("user@example.com"); // OK
validateEmail("invalid-email"); // "Invalid email format"
```

### Number Field Validators

#### 1. `validatePositiveNumber(value, fieldName)`
Only allow positive numbers (> 0).

```javascript
import { validatePositiveNumber } from "../utils/validationHelpers";

validatePositiveNumber(5, "Count"); // OK
validatePositiveNumber(0, "Count"); // "Count cannot be negative"
validatePositiveNumber(-5, "Count"); // "Count cannot be negative"
validatePositiveNumber("", "Count"); // "Count is required"
```

#### 2. `validateNonNegativeNumber(value, fieldName)`
Allow zero and positive numbers (≥ 0).

```javascript
import { validateNonNegativeNumber } from "../utils/validationHelpers";

validateNonNegativeNumber(0, "Count"); // OK
validateNonNegativeNumber(5, "Count"); // OK
validateNonNegativeNumber(-1, "Count"); // "Count cannot be negative"
```

#### 3. `validateNumberRange(value, min, max, fieldName)`
Validate number is within a range.

```javascript
import { validateNumberRange } from "../utils/validationHelpers";

validateNumberRange(5, 1, 10, "Rating"); // OK
validateNumberRange(15, 1, 10, "Rating"); // "Rating must be between 1 and 10"
```

### Utility Validators

#### 1. `trimValue(value)`
Remove leading/trailing whitespace.

```javascript
import { trimValue } from "../utils/validationHelpers";

trimValue("  Hello  "); // "Hello"
```

#### 2. `normalizeWhitespace(value)`
Remove extra spaces between words.

```javascript
import { normalizeWhitespace } from "../utils/validationHelpers";

normalizeWhitespace("Hello    World"); // "Hello World"
```

#### 3. `validateSelect(value, fieldName)`
Ensure a select field is not empty.

```javascript
import { validateSelect } from "../utils/validationHelpers";

validateSelect("", "Priority"); // "Please select a Priority"
validateSelect("HIGH", "Priority"); // OK
```

#### 4. `validateDate(value, fieldName)`
Validate date format (YYYY-MM-DD).

```javascript
import { validateDate } from "../utils/validationHelpers";

validateDate("2024-03-27", "Date"); // OK
validateDate("27-03-2024", "Date"); // "Date format must be YYYY-MM-DD"
```

#### 5. `validateTime(value, fieldName)`
Validate time format (HH:MM).

```javascript
import { validateTime } from "../utils/validationHelpers";

validateTime("14:30", "Start Time"); // OK
validateTime("2:30 PM", "Start Time"); // "Time format must be HH:MM (24-hour)"
```

#### 6. `validateTimeRange(startTime, endTime)`
Ensure end time is after start time.

```javascript
import { validateTimeRange } from "../utils/validationHelpers";

validateTimeRange("09:00", "17:00"); // OK
validateTimeRange("17:00", "09:00"); // "End time must be after start time"
```

#### 7. `validateFile(file, allowedTypes, maxSizeMB)`
Validate file type and size.

```javascript
import { validateFile } from "../utils/validationHelpers";

const file = new File([""], "photo.jpg", { type: "image/jpeg" });

validateFile(file, ["image/jpeg", "image/png"], 5); // OK
validateFile(file, ["application/pdf"], 5); // "Only these file types are allowed: application/pdf"
```

### Batch Validation

#### `validateForm(formData, rules)`
Validate multiple fields at once.

```javascript
import { validateForm, validateTitle, validateEmail } from "../utils/validationHelpers";

const errors = validateForm(
  {
    title: "",
    email: "invalid"
  },
  {
    title: (val) => validateTitle(val),
    email: (val) => validateEmail(val)
  }
);

// Returns:
// {
//   title: "Title is required",
//   email: "Invalid email format"
// }
```

---

## 📐 Yup Schemas

### Overview

Yup schemas provide declarative validation rules that integrate seamlessly with Formik.

### Field-Level Validators

These are pre-built Yup field validators that can be composed into custom schemas.

#### Available Field Validators

```javascript
import { validators } from "../utils/validationSchemas";

validators.title          // 10 words max, required
validators.description    // 50 words max, required
validators.descriptionOptional  // 50 words max, optional
validators.email          // Email format, required
validators.select         // Select required
validators.number         // Positive number, required
validators.numberOptional // Optional positive number
validators.date           // Date (YYYY-MM-DD), required
validators.time           // Time (HH:MM), required
validators.file           // Image file, required
```

### Pre-built Form Schemas

#### 1. `reportIncidentSchema`
For reporting incidents/tickets.

```javascript
import { reportIncidentSchema } from "../utils/validationSchemas";

/*
Fields:
- title: string (required, max 10 words)
- description: string (required, max 50 words)
- resourceId: string (required)
- priority: string (required, one of: LOW, MEDIUM, HIGH, CRITICAL)
- category: string (required)
*/

const errors = await reportIncidentSchema.validate(formData).catch(err => err);
```

#### 2. `availabilitySchema`
For adding availability slots.

```javascript
import { availabilitySchema } from "../utils/validationSchemas";

/*
Fields:
- resourceId: string (required)
- date: string (required, YYYY-MM-DD)
- startTime: string (required, HH:MM)
- endTime: string (required, HH:MM, must be after startTime)
*/
```

#### 3. `bookingSchema`
For creating bookings.

```javascript
import { bookingSchema } from "../utils/validationSchemas";

/*
Fields:
- resourceId: string (required)
- date: string (required, YYYY-MM-DD)
- startTime: string (required, HH:MM)
- endTime: string (required, HH:MM, must be after startTime)
- bookedBy: string (required)
- userId: string (required)
*/
```

#### 4. `resourceSchema`
For resource management.

```javascript
import { resourceSchema } from "../utils/validationSchemas";

/*
Fields:
- name: string (required, max 10 words)
- description: string (optional, max 50 words)
- location: string (required)
- capacity: number (required, positive)
- type: string (required)
*/
```

#### 5. `loginSchema`
For user login.

```javascript
import { loginSchema } from "../utils/validationSchemas";

/*
Fields:
- email: string (required, valid email format)
- password: string (required, min 6 characters)
*/
```

#### 6. `userProfileSchema`
For user profile editing.

```javascript
import { userProfileSchema } from "../utils/validationSchemas";

/*
Fields:
- name: string (required, min 2 characters)
- email: string (required, valid email)
- phone: string (optional, valid phone format)
*/
```

### Custom Schemas

Use `createFormSchema()` to create custom validation schemas:

```javascript
import { createFormSchema, validators } from "../utils/validationSchemas";

const customSchema = createFormSchema({
  title: validators.title,
  description: validators.description,
  priority: validators.select,
  capacity: validators.number,
});
```

---

## 💻 Implementation Examples

### Example 1: Basic Form with Formik

```javascript
import { Formik, Form, Field, ErrorMessage } from "formik";
import { reportIncidentSchema } from "../utils/validationSchemas";

function MyForm() {
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Process form submission
      console.log("Form submitted:", values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        resourceId: "",
        priority: "MEDIUM",
        category: "MAINTENANCE",
      }}
      validationSchema={reportIncidentSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          {/* TITLE FIELD */}
          <div>
            <label>Title *</label>
            <Field
              type="text"
              name="title"
              placeholder="Enter title"
              style={{
                borderColor: touched.title && errors.title ? "red" : "gray",
              }}
            />
            <ErrorMessage name="title" />
          </div>

          {/* DESCRIPTION FIELD */}
          <div>
            <label>Description *</label>
            <Field
              as="textarea"
              name="description"
              placeholder="Enter description"
            />
            <ErrorMessage name="description" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

### Example 2: Form with Real-time Validation

```javascript
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createFormSchema, validators } from "../utils/validationSchemas";
import { countWords } from "../utils/validationHelpers";

function AdvancedForm() {
  const schema = createFormSchema({
    title: validators.title,
    description: validators.description,
  });

  return (
    <Formik
      initialValues={{ title: "", description: "" }}
      validationSchema={schema}
      validateOnChange={true}  // Validate as user types
      validateOnBlur={true}    // Validate when field loses focus
      onSubmit={(values) => {
        console.log("Submitted:", values);
      }}
    >
      {({ values, errors, touched }) => (
        <Form>
          <div>
            <label>
              Title
              {values.title && (
                <span>({countWords(values.title)} words)</span>
              )}
            </label>
            <Field
              type="text"
              name="title"
              style={{
                borderColor: touched.title && errors.title ? "red" : "gray",
              }}
            />
            <ErrorMessage name="title" />
          </div>

          <div>
            <label>
              Description
              {values.description && (
                <span>({countWords(values.description)} words)</span>
              )}
            </label>
            <Field
              as="textarea"
              name="description"
              style={{
                borderColor: touched.description && errors.description ? "red" : "gray",
              }}
            />
            <ErrorMessage name="description" />
          </div>

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

### Example 3: Dynamic Field Validation

```javascript
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { createFormSchema, validators } from "../utils/validationSchemas";

function DynamicForm() {
  const schema = createFormSchema({
    title: validators.title,
    items: yup.array().of(
      yup.object().shape({
        name: validators.title,
        price: validators.number,
      })
    ),
  });

  return (
    <Formik
      initialValues={{
        title: "",
        items: [{ name: "", price: "" }],
      }}
      validationSchema={schema}
      onSubmit={(values) => {
        console.log("Submitted:", values);
      }}
    >
      {({ values, errors, touched }) => (
        <Form>
          <div>
            <label>Form Title</label>
            <Field type="text" name="title" />
            <ErrorMessage name="title" />
          </div>

          <FieldArray name="items">
            {(fieldArrayHelpers) => (
              <div>
                {values.items.map((item, index) => (
                  <div key={index}>
                    <Field
                      type="text"
                      name={`items.${index}.name`}
                      placeholder="Item name"
                    />
                    <ErrorMessage name={`items.${index}.name`} />

                    <Field
                      type="number"
                      name={`items.${index}.price`}
                      placeholder="Price"
                    />
                    <ErrorMessage name={`items.${index}.price`} />

                    <button
                      type="button"
                      onClick={() => fieldArrayHelpers.remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    fieldArrayHelpers.push({ name: "", price: "" })
                  }
                >
                  Add Item
                </button>
              </div>
            )}
          </FieldArray>

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## ✅ Best Practices

### 1. Always Trim Input

```javascript
// In Yup schema (automatic)
yup.string().required().transform(val => val?.trim?.() || "")

// Or manually in component
const trimmedValue = value.trim();
```

### 2. Show Word Count While Typing

```javascript
import { countWords } from "../utils/validationHelpers";

<Field name="description" />
<span>Words: {countWords(values.description)}/50</span>
```

### 3. Disable Submit Button Until Valid

```javascript
<button type="submit" disabled={!isValid || isSubmitting}>
  {isSubmitting ? "Submitting..." : "Submit"}
</button>
```

### 4. Group Related Validations

```javascript
// Create custom schemas for related forms
const incidentSchema = reportIncidentSchema;
const bookingSchema = bookingSchema;

// Reuse in multiple components
```

### 5. Use Field-Level Validation as Fallback

```javascript
// Primary: Schema validation
// Fallback: Helper functions for manual validation

import { validateTitle } from "../utils/validationHelpers";

const error = validateTitle(manualInput);
if (error) {
  // Handle error
}
```

### 6. Show User-Friendly Error Messages

```javascript
// ✅ Good
"Title cannot exceed 10 words (15 words)"

// ❌ Bad
"maxWords validation failed"
```

### 7. Validate Before Hiding Fields

```javascript
// Always display error messages until explicitly addressed
{touched.field && errors.field && (
  <span style={{ color: "red" }}>{errors.field}</span>
)}
```

### 8. Handle Async Validation

```javascript
const schema = yup.object().shape({
  email: yup.string()
    .email()
    .required()
    .test('unique-email', 'Email already exists', async (value) => {
      const response = await checkEmailExists(value);
      return !response.exists;
    })
});
```

---

## 🐛 Troubleshooting

### Problem: Validation not triggering

**Solution:** Set both `validateOnChange` and `validateOnBlur`:
```javascript
<Formik
  validateOnChange={true}
  validateOnBlur={true}
  // ...
/>
```

### Problem: Errors not showing

**Solution:** Use `touched` to only show errors after user interaction:
```javascript
{touched.field && errors.field && <ErrorMessage name="field" />}
```

### Problem: Custom validation not working

**Solution:** Ensure Yup method is added before schema:
```javascript
yup.addMethod(yup.string, "customRule", function() {
  // Custom validation logic
});

// Use after adding the method
const schema = yup.object().shape({
  field: yup.string().customRule()
});
```

### Problem: Form submitting despite errors

**Solution:** Check `isValid` before enabling submit:
```javascript
<button disabled={!isValid || isSubmitting}>Submit</button>
```

### Problem: Word count validator not working

**Solution:** Import `countWords` from helpers:
```javascript
import { countWords } from "../utils/validationHelpers";

// The Yup schema already includes word count validation
```

---

## 📚 File Locations

- **Validation Helpers**: `src/utils/validationHelpers.js`
- **Validation Schemas**: `src/utils/validationSchemas.js`
- **Example Forms**: 
  - `src/components/ReportIncidentForm.js`
  - `src/components/AvailabilityForm.js`

---

## 🔗 Quick Reference

| Validator | Purpose | Usage |
|-----------|---------|-------|
| `countWords()` | Count words | `countWords("text")` |
| `validateTitle()` | Title (10 words max) | Manual validation |
| `validateDescription()` | Description (50 words max) | Manual validation |
| `validateEmail()` | Email format | Manual validation |
| `validateDate()` | Date format (YYYY-MM-DD) | Manual validation |
| `validateTime()` | Time format (HH:MM) | Manual validation |
| `validatePositiveNumber()` | Positive numbers only | Manual validation |
| `reportIncidentSchema` | Incident form validation | `validationSchema={reportIncidentSchema}` |
| `availabilitySchema` | Availability form validation | `validationSchema={availabilitySchema}` |
| `createFormSchema()` | Build custom schemas | `createFormSchema({...})` |

---

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review implementation examples
3. Consult Formik docs: https://formik.org
4. Consult Yup docs: https://github.com/jquense/yup
