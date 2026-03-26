import React from "react";

const Login = () => {

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Faculty Booking System</h2>
        <p>Login with Google to continue</p>

        <button style={styles.button} onClick={handleGoogleLogin}>
          🔐 Sign in with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white"
  },
  card: {
    padding: "30px",
    background: "#1e293b",
    borderRadius: "10px",
    textAlign: "center"
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#22c55e",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Login;