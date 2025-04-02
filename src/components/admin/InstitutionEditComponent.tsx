"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InstitutionEdit({ institution, onSave }) {
  const [formData, setFormData] = useState({ ...institution });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/institutions/${institution?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update institution");

        const updatedData = await response.json();
        console.log('updatedData', updatedData);
      onSave(updatedData);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Institution</h2>
      <Input name="name" value={formData.name} onChange={handleChange} placeholder="Institution Name" />
      <Input name="type" value={formData.type} onChange={handleChange} placeholder="Institution Type" />
      <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
      <Input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
      <Input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
      <Input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
      <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
      <Input name="website" value={formData.website} onChange={handleChange} placeholder="Website" />
      <Button type="submit">Save Changes</Button>
    </form>
  );
}
