import React from "react";

const Login = () => {

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundShapes}>
        <div style={styles.shape1}></div>
        <div style={styles.shape2}></div>
        <div style={styles.shape3}></div>
        <div style={styles.shape4}></div>
      </div>

      {/* Main Card */}
      <div style={styles.card}>
        {/* Logo Icon */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>🏫</div>
        </div>

        {/* Title Section */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>CBH Campus</h1>
          <p style={styles.subtitle}>Faculty Resource Management System</p>
        </div>

        {/* Decorative Line */}
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerIcon}>✨</span>
          <span style={styles.dividerLine}></span>
        </div>

        {/* Login Button */}
        <button 
          style={styles.button} 
          onClick={handleGoogleLogin}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(66, 153, 225, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(66, 153, 225, 0.2)";
          }}
        >
          <span style={styles.buttonIcon}>🔐</span>
          Sign in with Google
          <span style={styles.buttonArrow}>→</span>
        </button>

        {/* Footer Text */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Secure access with your institutional Google account</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  
  // Animated Background Shapes
  backgroundShapes: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 0,
  },
  
  shape1: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "300px",
    height: "300px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    opacity: 0.3,
    animation: "float 8s ease-in-out infinite",
  },
  
  shape2: {
    position: "absolute",
    bottom: "-10%",
    left: "-5%",
    width: "250px",
    height: "250px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    borderRadius: "50%",
    opacity: 0.3,
    animation: "float 10s ease-in-out infinite reverse",
  },
  
  shape3: {
    position: "absolute",
    top: "30%",
    left: "20%",
    width: "150px",
    height: "150px",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    borderRadius: "50%",
    opacity: 0.2,
    animation: "pulse 4s ease-in-out infinite",
  },
  
  shape4: {
    position: "absolute",
    bottom: "20%",
    right: "15%",
    width: "180px",
    height: "180px",
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    borderRadius: "50%",
    opacity: 0.2,
    animation: "float 12s ease-in-out infinite",
  },
  
  // Main Card
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "90%",
    maxWidth: "480px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "slideUp 0.5s ease-out",
  },
  
  // Logo Section
  logoWrapper: {
    marginBottom: "24px",
  },
  
  logoIcon: {
    fontSize: "64px",
    display: "inline-block",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: "100px",
    height: "100px",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
  },
  
  // Title Section
  titleSection: {
    marginBottom: "20px",
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },
  
  // Divider
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  
  dividerLine: {
    width: "80px",
    height: "1px",
    background: "linear-gradient(90deg, transparent, #cbd5e1, transparent)",
  },
  
  dividerIcon: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  
  // Button
  button: {
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
  },
  
  buttonIcon: {
    fontSize: "18px",
  },
  
  buttonArrow: {
    fontSize: "16px",
    transition: "transform 0.2s ease",
  },
  
  // Footer
  footer: {
    marginTop: "16px",
  },
  
  footerText: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },
};

// Add keyframe animations to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-20px) translateX(10px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.1); opacity: 0.3; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;