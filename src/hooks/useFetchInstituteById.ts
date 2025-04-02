import { useState, useEffect } from 'react';

const useFetchInstituteById = (institutionId: string) => {
    const [institution, setInstitution] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/institutions/${institutionId}`);
                
                if (!response.ok) {
                    throw new Error("Failed to fetch institution details");
                }
                
                const data = await response.json();
                setInstitution(data);
            } catch (err) {
                console.error("Error fetching institution:", err);
                setError(err instanceof Error ? err.message : "Failed to load institution details.");
            } finally {
                setLoading(false);
            }
        };

        if (institutionId) {
            fetchInstitution();
        } else {
            setLoading(false);
            setError("No institution ID provided");
        }
    }, [institutionId]);

    return { institution, loading, error };
};

export default useFetchInstituteById;