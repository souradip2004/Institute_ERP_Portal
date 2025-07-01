"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label as FormLabel } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Globe,
  Upload,
  Palette,
  XCircle // For cancel button
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { S3Utils } from "@/utils/s3Utils";

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
  logoUrl: string; // This will store the Cloudinary URL
  primaryColor: string;
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
      logoUrl: "",
      primaryColor: "#000000",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      setLogoPreview(URL.createObjectURL(file));
      form.clearErrors("logoUrl"); // Clear any previous errors related to logoUrl
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const uploadImageToCloudinary = useCallback(async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3
      const key = await S3Utils.uploadFile(buffer, file.name, file.type);

      // Get both URLs
      const signedUrl = await S3Utils.getFileUrl(key);
      const publicUrl = S3Utils.getPublicUrl(key);

      console.log(publicUrl)
      return publicUrl; // Return the public URL for the image
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Image upload failed. Please try again.");
    }
  }, []);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let uploadedLogoUrl = data.logoUrl;

      if (logoFile) {
        uploadedLogoUrl = await uploadImageToCloudinary(logoFile);
      }

      const submissionData = {
        ...data,
        logoUrl: uploadedLogoUrl,
        primaryColor: selectedColor,
      };

      console.log("Submitting Institution Data:", submissionData);

      // Step 1: Create Institution
      const res = await fetch("https://commercial.aiclassroom.in/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    form.setValue("primaryColor", color);
  };

  const handleCancelColorPicker = () => {
    setShowColorPicker(false);
    setSelectedColor(form.getValues("primaryColor")); // Revert to the last saved color or default
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

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-indigo-500" />
              Institution Logo
            </FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {logoPreview && (
              <div className="mt-4 flex items-center gap-4">
                <img src={logoPreview} alt="Logo Preview" className="h-20 w-20 object-contain" />
                <p className="text-sm text-gray-500">{logoFile?.name}</p>
              </div>
            )}
            {form.formState.errors.logoUrl && (
              <p className="text-sm text-red-500 mt-1">Please upload an institution logo.</p>
            )}
          </div>

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-indigo-500" />
              Primary Color
            </FormLabel>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <div
                  className="w-5 h-5 rounded-full border border-gray-400"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                {showColorPicker ? "Hide Color Picker" : "Choose Primary Color"}
              </Button>
              {showColorPicker && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelColorPicker}
                  className="flex items-center gap-2 text-red-500 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
            {showColorPicker && (
              <div className="mt-4">
                <HexColorPicker color={selectedColor} onChange={handleColorChange} />
              </div>
            )}
            <Input
              type="hidden"
              {...form.register("primaryColor")}
              value={selectedColor}
            />
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