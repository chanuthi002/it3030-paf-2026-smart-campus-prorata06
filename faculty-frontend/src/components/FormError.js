/**
 * 💭 CUSTOM ERROR DISPLAY COMPONENT
 * Reusable error message component with styling
 * 
 * Usage:
 * <FormError name="fieldName" />
 */

import { ErrorMessage } from "formik";

function FormError({ name, style = {} }) {
  const defaultStyle = {
    color: "#d32f2f",
    fontSize: "12px",
    marginTop: "3px",
    fontWeight: "500",
  };

  return (
    <ErrorMessage name={name}>
      {(msg) => (
        <div style={{ ...defaultStyle, ...style }}>
          ⚠️ {msg}
        </div>
      )}
    </ErrorMessage>
  );
}

export default FormError;
