import React, { useEffect, useState } from "react";

const Dashboard = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email");
    const name = params.get("name");
    const role = params.get("role");
    const id = params.get("id");

    if (email) {
      const userData = { email, name, role, id };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // ✅ clean URL
      window.history.replaceState({}, document.title, "/dashboard");
    } else {
      const stored = JSON.parse(localStorage.getItem("user"));
      setUser(stored);
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      {user ? (
        <>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </>
      ) : (
        <p>No user data</p>
      )}

      
    </div>
  );
};

export default Dashboard;