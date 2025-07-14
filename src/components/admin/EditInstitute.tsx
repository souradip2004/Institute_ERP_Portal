'use client'

import { useState } from "react";
import Loader from "@/components/ui/Loader"; // Kept for the 'submitting' state
import { Suspense } from "react";

// The props are now the source of truth for the initial form data.
export default function EditDashboardPage({ instituteID, name, email, phone, website, address, city, state, country, type, primaryColor }) {

    // 1. Initialize the form state directly from the props.
    // The `|| ''` ensures that if a prop is null or undefined, it defaults to an empty string.
    const [form, setForm] = useState({
        name: name || "",
        email: email || "",
        phone: phone || "",
        website: website || "",
        address: address || "",
        city: city || "",
        state: state || "",
        country: country || "",
        type: type || "",
        primaryColor: primaryColor || "",
    });

    // 2. The `loading` state and `useEffect` hook for fetching are no longer needed.
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // The submission logic remains the same.
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${instituteID}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update institute");
            }
            setSuccess("Institute updated successfully!");
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // A simple guard clause in case the component is rendered without necessary props.
    if (!instituteID) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">No institute selected to edit.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-950">
            <Suspense fallback={<Loader size="large" fullScreen message="Loading dashboard..." />}>
                <main className="container mx-auto px-4 py-8 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6">Edit Institute: {name}</h2>
                    {/* 3. Removed the conditional rendering for `loading` and fetch `error`. */}
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow">
                        <div>
                            <label htmlFor="name" className="block font-medium mb-1">Name</label>
                            <input id="name" name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block font-medium mb-1">Email</label>
                            <input id="email" name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" type="email" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block font-medium mb-1">Phone</label>
                            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label htmlFor="website" className="block font-medium mb-1">Website</label>
                            <input id="website" name="website" value={form.website} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block font-medium mb-1">Address</label>
                            <input id="address" name="address" value={form.address} onChange={handleChange} className="w-full p-2 border rounded" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="city" className="block font-medium mb-1">City</label>
                                <input id="city" name="city" value={form.city} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label htmlFor="state" className="block font-medium mb-1">State</label>
                                <input id="state" name="state" value={form.state} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label htmlFor="country" className="block font-medium mb-1">Country</label>
                                <input id="country" name="country" value={form.country} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="type" className="block font-medium mb-1">Type</label>
                            <select
                                id="type"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select type</option>
                                <option value="School">School</option>
                                <option value="College">College</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="primaryColor" className="block font-medium mb-1">Primary Color</label>
                            <input
                                id="primaryColor"
                                name="primaryColor"
                                type="color"
                                value={form.primaryColor}
                                onChange={handleChange}
                                className="w-16 h-10 p-1 border rounded cursor-pointer"
                                style={{ background: form.primaryColor }}
                            />
                        </div>

                        {/* Error and Success messages for the submission */}
                        {success && <div className="text-green-600 p-3 bg-green-50 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">{success}</div>}
                        {error && <div className="text-red-500 p-3 bg-red-50 dark:bg-red-900/50 rounded-md border border-red-200 dark:border-red-800">{error}</div>}

                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </main>
            </Suspense>
        </div>
    );
}