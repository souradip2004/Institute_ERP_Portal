"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function InstitutionDetail({ institution, onEdit }) {
  if (!institution) return <p>No institution data available.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Institution Details</h2>
      <p><strong>Name:</strong> {institution.name}</p>
      <p><strong>Type:</strong> {institution.type}</p>
      <p><strong>Address:</strong> {institution.address}</p>
      <p><strong>City:</strong> {institution.city}</p>
      <p><strong>State:</strong> {institution.state}</p>
      <p><strong>Country:</strong> {institution.country}</p>
      <p><strong>Email:</strong> {institution.email}</p>
      <p><strong>Phone:</strong> {institution.phone}</p>
      <p><strong>Website:</strong> <a href={institution.website} target="_blank" className="text-blue-500 underline">{institution.website}</a></p>
      <p><strong>Subscription Status:</strong> {institution.subscriptionStatus}</p>
      <Button onClick={onEdit} className="mt-4">Edit Institution</Button>
    </div>
  );
}
