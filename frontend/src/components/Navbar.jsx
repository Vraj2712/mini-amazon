// frontend/src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
// import "./Navbar.css";   <-- Removed or commented out

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/products" style={styles.link}>Products</Link>
      <Link to="/cart" style={styles.link}>Cart</Link>
      <Link to="/login" style={styles.link}>Login</Link>
      <Link to="/Signup" style={styles.link}>SignUp</Link>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#333",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Navbar;
