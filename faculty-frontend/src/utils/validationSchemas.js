import * as yup from "yup";
import { countWords } from "./validationHelpers";

yup.addMethod(yup.string, "maxWords", function maxWords(limit, message) {
  return this.test("max-words", message || `Cannot exceed ${limit} words`, function validate(value) {
    if (!value) {
      return true;
    }

    const total = countWords(value);
    if (total <= limit) {
      return true;
    }

    return this.createError({
      path: this.path,
      message: message || `Cannot exceed ${limit} words (${total} words)`,
    });
  });
});

const requiredTrimmedText = (label) =>
  yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .required(`${label} is required`);

const titleField = requiredTrimmedText("Title").maxWords(10, "Title cannot exceed 10 words");

const descriptionField = requiredTrimmedText("Description").maxWords(
  50,
  "Description cannot exceed 50 words"
);

const requiredSelect = (label) =>
  yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .required(`${label} is required`)
    .notOneOf([""], `${label} is required`);

const requiredNonNegativeNumber = (label) =>
  yup
    .number()
    .typeError(`${label} must be a valid number`)
    .required(`${label} is required`)
    .min(0, `${label} cannot be negative`);

const requiredDate = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .matches(/^\d{4}-\d{2}-\d{2}$/, `${label} must be in YYYY-MM-DD format`);

const requiredTime = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} must be in HH:MM format`);

const withValidTimeRange = (schema) =>
  schema.test("end-after-start", "End time must be after start time", function testRange(values) {
    if (!values?.startTime || !values?.endTime) {
      return true;
    }

    const start = new Date(`2000-01-01 ${values.startTime}`);
    const end = new Date(`2000-01-01 ${values.endTime}`);

    if (end > start) {
      return true;
    }

    return this.createError({ path: "endTime", message: "End time must be after start time" });
  });

export const reportIncidentSchema = yup.object({
  title: titleField,
  description: descriptionField,
  resourceId: requiredSelect("Resource"),
  priority: requiredSelect("Priority"),
  category: requiredSelect("Category"),
});

export const availabilitySchema = withValidTimeRange(
  yup.object({
    resourceId: requiredSelect("Resource"),
    date: requiredDate("Date"),
    startTime: requiredTime("Start time"),
    endTime: requiredTime("End time"),
  })
);

export const bookingSchema = withValidTimeRange(
  yup.object({
    resourceId: requiredSelect("Resource"),
    date: requiredDate("Date"),
    startTime: requiredTime("Start time"),
    endTime: requiredTime("End time"),
    bookedBy: requiredTrimmedText("Booked by"),
    userId: requiredSelect("User"),
  })
);

export const resourceSchema = yup.object({
  name: titleField,
  type: requiredSelect("Type"),
  capacity: requiredNonNegativeNumber("Capacity"),
  location: requiredSelect("Location"),
  status: requiredSelect("Status"),
});

export const createFormSchema = (fields) => yup.object(fields);

export const validators = {
  title: titleField,
  description: descriptionField,
  select: requiredSelect,
  number: requiredNonNegativeNumber,
  date: requiredDate,
  time: requiredTime,
};
