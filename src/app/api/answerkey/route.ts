
import { NextResponse } from 'next/server';

/**
 * Handles POST requests to segregate PDFs using a Beam Cloud endpoint.
 * This acts as a proxy to bypass frontend CORS restrictions and secure the API key.
 * It includes retry logic with exponential backoff for robustness.
 */
export async function POST(request: Request) {
  const maxRetries = 3; // Maximum number of retry attempts
  let retryCount = 0;   // Current retry attempt count
  let delay = 1000;     // Initial delay for exponential backoff (1 second)

  try {
    // Parse the request body to get the fileUrls array from the frontend
    const { fileUrls } = await request.json();

    // Validate the input: ensure fileUrls is provided and is an array
    if (!fileUrls || !Array.isArray(fileUrls)) {
      console.error('[Backend Proxy] Invalid input: fileUrls must be an array.');
      return NextResponse.json({ error: 'Invalid input: fileUrls must be an array.' }, { status: 400 });
    }

    // Loop for retries
    while (retryCount < maxRetries) {
      try {
        console.log(`[Backend Proxy] 🔄 Sending PDF URL(s) to AnsKey Segregate API... (Attempt ${retryCount + 1}/${maxRetries})`);
        console.log(`[Backend Proxy] fileUrls:`, fileUrls);

        // Make the actual fetch request to the Beam Cloud endpoint
        const beamResponse = await fetch('https://anskey-segregate-from-pdfs-33f7051-v13.app.beam.cloud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // IMPORTANT: Keep your Authorization token secure on the backend
            'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA=='
          },
          body: JSON.stringify({
            'file_url_list': fileUrls // Send the file URLs to Beam
          })
        });

        // Check if the response from Beam was successful (status code 2xx)
        if (!beamResponse.ok) {
          console.error(`[Backend Proxy] ❌ Beam API returned an unsuccessful status code: ${beamResponse.status}`);
          if (beamResponse.status >= 500) {
            // If it's a server-side error from Beam (5xx), we can retry
            throw new Error(`Beam Server Error: ${beamResponse.statusText}`);
          } else {
            // For client-side errors (4xx) from Beam, it's likely not a temporary issue,
            // so we don't retry and immediately return the error to the frontend.
            const errorBody = await beamResponse.text();
            console.error(`[Backend Proxy] ❌ Not retrying for Beam client error: ${beamResponse.status} - ${errorBody}`);
            return NextResponse.json({ error: `Beam API Error: ${beamResponse.status} - ${errorBody}` }, { status: beamResponse.status });
          }
        }

        // If Beam response is OK, parse the JSON and send it back to the frontend
        const beamData = await beamResponse.json();
        console.log("[Backend Proxy] ✅ PDF Segregation Response from Beam:", beamData);
        // Return the data received from Beam to the client
        return NextResponse.json({ data: beamData.data }, { status: 200 });

      } catch (error: any) {
        // Catch errors during the fetch call to Beam (e.g., network issues, timeouts)
        console.error(`[Backend Proxy] ❌ Error during PDF Segregation (Beam call):`, error.message);
        retryCount++; // Increment retry count

        if (retryCount < maxRetries) {
          // If retries are still available, wait and then try again
          console.log(`[Backend Proxy] ⏱️ Retrying in ${delay / 1000} seconds...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Double the delay for exponential backoff
        } else {
          // If all retry attempts are exhausted, re-throw the error to be caught by the outer try-catch
          console.error(`[Backend Proxy] ❌ All retry attempts failed for Beam call. Throwing final error.`);
          throw error;
        }
      }
    }
    // This line should ideally not be reached if the loop completes successfully or throws an error
    return NextResponse.json({ error: 'Failed to segregate PDF after multiple retries.' }, { status: 500 });

  } catch (error: any) {
    // Catch any unexpected errors that occur outside the retry loop or after all retries fail
    console.error(`[Backend Proxy] ❌ Unhandled error in segregatePdf API route:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error during PDF segregation.' }, { status: 500 });
  }
}
