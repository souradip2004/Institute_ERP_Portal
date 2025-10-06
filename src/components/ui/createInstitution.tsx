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
  logoUrl: string;
  primaryColor: string;
}
interface Verification {
  approxStudents: number;
  numTeachers: number;
  institutionDocument: string;
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
  const verify = useForm<Verification>({
    defaultValues: {
      approxStudents: 0,
      numTeachers: 0,
      institutionDocument: ""
    }
  })

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [institutionDocumentFile, setInstitutionDocumentFile] = useState<File | null>(null);
  const [institutionDocumentPreview, setInstitutionDocumentPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFileChangeInstitutionDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInstitutionDocumentFile(file);

      setInstitutionDocumentPreview(URL.createObjectURL(file));
      //form.clearErrors("institutionDocument"); // Clear any previous errors related to logoUrl
    } else {
      setInstitutionDocumentFile(null);
      setInstitutionDocumentPreview(null);
    }
  };

  const uploadImageToS3 = useCallback(async (file: File): Promise<string> => {
    try {
      const key = await S3Utils.uploadFile(file, file.name, file.type);
      const publicUrl = S3Utils.getPublicUrl(key);
      return publicUrl;
    } catch (err) {
      console.error("S3 upload error:", err);
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
        uploadedLogoUrl = await uploadImageToS3(logoFile);
      }

      const submissionData = {
        ...data,
        logoUrl: uploadedLogoUrl,
        primaryColor: selectedColor,
      };

      console.log("Submitting Institution Data:", submissionData);

      // Step 1: Create Institution
      const res = await fetch(`/api/institutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) throw new Error("Failed to create institution.");
      const institution = await res.json();
      console.log("Institution Created:", institution);

      if (!institution.id) throw new Error("Institution ID is missing from the response.");

      const updateUserRes = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: institution.id }),
      });
      let data2 = localStorage.getItem("user");
      let data1 = JSON.parse(data2 || "{}");
      if (data1) {
        data1.institutionId = institution.id;
        localStorage.setItem("user", JSON.stringify(data1));
      }
      console.log("Update User Response:", await updateUserRes.json());

      if (!updateUserRes.ok) throw new Error("Failed to update user.");
      console.log("User Updated Successfully!");
      const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          userId: userId,
          institutionid: institution.id,
          institutionName: data.name,
          document: institutionDocumentFile ? await uploadImageToS3(institutionDocumentFile) : "",
          studentcounts: verify.getValues("approxStudents"),
          teachercount: verify.getValues("numTeachers"),
        }),
      });
      if (!res1.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send verification email.");
      }
      console.log("Verification email sent successfully!");
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
                {...form.register("phone", {
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                className="w-full"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9+\-\s()]/g, '');
                }}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
              )}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                Approx. Number of Students
              </FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="Enter number of students"
                {...verify.register("approxStudents", { required: true, min: 0 })}
                className="w-full"
              />
            </div>
            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                Number of Teachers
              </FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="Enter number of teachers"
                {...verify.register("numTeachers", { required: true, min: 0 })}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-indigo-500" />
              Upload Institution Document (ID Card or Proof of Address)
            </FormLabel>
            <div className="space-y-3">
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChangeInstitutionDocument}
                className="w-full"
              />
              {institutionDocumentFile && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {institutionDocumentFile.type.startsWith('image/') ? (
                          <img
                            src={institutionDocumentPreview || ''}
                            alt="Document Preview"
                            className="h-12 w-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded border flex items-center justify-center">
                            <Upload className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {institutionDocumentFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(institutionDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInstitutionDocumentFile(null);
                        setInstitutionDocumentPreview(null);
                      }}
                      className="text-red-500 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {verify.formState.errors.institutionDocument && (
              <p className="text-sm text-red-500 mt-1">Please upload a valid document.</p>
            )}
          </div>
          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-indigo-500" />
              Institution Logo
            </FormLabel>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {logoPreview && logoFile && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="h-20 w-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}
                            className="h-6 w-6 p-0 rounded-full bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {logoFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(logoFile.size / 1024 / 1024).toFixed(2)} MB • {logoFile.type}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Ready to upload
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {form.formState.errors.logoUrl && (
              <p className="text-sm text-red-500 mt-1">Please upload an institution logo.</p>
            )}
          </div>

          <div>
            <FormLabel className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-indigo-500" />
              Primary Color
            </FormLabel>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 w-full sm:w-auto"
                >
                  <div
                    className="w-5 h-5 rounded-full border border-gray-400 flex-shrink-0"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <span className="truncate">
                    {showColorPicker ? "Hide Color Picker" : "Choose Primary Color"}
                  </span>
                </Button>
                {showColorPicker && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelColorPicker}
                    className="flex items-center gap-2 text-red-500 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 w-full sm:w-auto"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>

              {/* Color preview card */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Selected Color
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {selectedColor.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {showColorPicker && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-center">
                    <HexColorPicker color={selectedColor} onChange={handleColorChange} />
                  </div>
                </div>
              )}
            </div>
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