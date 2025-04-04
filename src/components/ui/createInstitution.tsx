"use client";

import { useState } from "react";

export default function CreateInstitutionForm({ userId }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "college",
    address: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Submitting Institution Data:", formData);

      // Step 1: Create Institution
      const res = await fetch("http://localhost:3000/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create institution.");
      const institution = await res.json();
      console.log("Institution Created:", institution);

      // Step 2: Update User with Institution ID
      if (!institution.id) throw new Error("Institution ID is missing from the response.");

      const updateUserRes = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: institution.id }),
      });

      console.log("Update User Response:", await updateUserRes.json());

      if (!updateUserRes.ok) throw new Error("Failed to update user.");
      console.log("User Updated Successfully!");

      setSuccess("Institution created and linked successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Create Institution</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <input type="text" name="name" placeholder="Institution Name" onChange={handleChange} required style={styles.input} />
      <select name="type" onChange={handleChange} required style={styles.input}>
        <option value="college">College</option>
        <option value="university">University</option>
      </select>
      <input type="text" name="address" placeholder="Address" onChange={handleChange} required style={styles.input} />
      <input type="text" name="city" placeholder="City" onChange={handleChange} required style={styles.input} />
      <input type="text" name="state" placeholder="State" onChange={handleChange} required style={styles.input} />
      <input type="text" name="country" placeholder="Country" onChange={handleChange} required style={styles.input} />
      <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} style={styles.input} />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
      <input type="url" name="website" placeholder="Website URL" onChange={handleChange} style={styles.input} />

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Creating..." : "Create Institution"}
      </button>
    </form>
  );
}

// Inline CSS Styles
const styles = {
  form: {
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    marginBottom: "10px",
  },
};
