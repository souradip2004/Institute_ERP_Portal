"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label as FormLabel } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Globe
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateInstitutionFormProps {
  userId: string;
  email: string;
}

interface FormData {
  name: string;
  type: "college" | "university";
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  userId: string;
}

export default function CreateInstitutionForm({ userId, email }: CreateInstitutionFormProps) {
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "college",
      address: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      email: email || "",
      website: "",
      userId: userId,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Submitting Institution Data:", data);

      // Step 1: Create Institution
      const res = await fetch("https://commercial.aiclassroom.in/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create institution.");
      const institution = await res.json();
      console.log("Institution Created:", institution);

      if (!institution.id) throw new Error("Institution ID is missing from the response.");

      const updateUserRes = await fetch(`https://commercial.aiclassroom.in/api/users/${userId}`, {
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
    } catch (err: unknown) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <FormLabel className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                Institution Name
              </FormLabel>
              <Input
                placeholder="Enter institution name"
                {...form.register("name", { required: true })}
                className="w-full"
              />
            </div>

            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                Type
              </FormLabel>
              <select
                {...form.register("type")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="college">College</option>
                <option value="university">School</option>
              </select>
            </div>

            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                Phone Number
              </FormLabel>
              <Input
                type="tel"
                placeholder="Enter phone number"
                {...form.register("phone")}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              Email
            </FormLabel>
            <Input
              type="email"
              placeholder="Enter email address"
              {...form.register("email", { required: true })}
              className="w-full"
              defaultValue={email}
            />
          </div>

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-indigo-500" />
              Website URL
            </FormLabel>
            <Input
              type="url"
              placeholder="Enter website URL"
              {...form.register("website")}
              className="w-full"
            />
          </div>

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Address
            </FormLabel>
            <Input
              placeholder="Enter street address"
              {...form.register("address", { required: true })}
              className="w-full mb-3"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="City"
                {...form.register("city", { required: true })}
                className="w-full"
              />
              <Input
                placeholder="State/Province"
                {...form.register("state", { required: true })}
                className="w-full"
              />
              <Input
                placeholder="Country"
                {...form.register("country", { required: true })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          {loading ? "Creating..." : "Create Institution"}
        </Button>
      </form>
    </div>
  );
}
