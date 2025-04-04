import { useState } from "react";
import { API_URLS, API_AUTH_TOKEN } from "../lib/constants";

export interface SentenceDuration {
  [sentenceId: string]: [string, number]; // [sentence text, duration in seconds]
}

export interface AudioProcessingResponse {
  "Chunk Audio url": string;
  sentence_with_audio_durations: SentenceDuration;
  last_sentence: string;
  UID: string;
}

export const useAudioProcessingApi = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sentenceDurations, setSentenceDurations] = useState<SentenceDuration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processChunk = async (chunk: string, lang: string = "english", uid: string = "default", chunkNumber: number = 1, lastSentence: string = "") => {
    try {
      const response = await fetch(API_URLS.AUDIO_PROCESSING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          chunk,
          lang,
          UID: uid,
          chunk_number: chunkNumber,
          last_sentence_of_prev_chunk: lastSentence
        }),
      });

      const result = await response.json() as AudioProcessingResponse;
      setAudioUrl(result["Chunk Audio url"]);
      setSentenceDurations(result.sentence_with_audio_durations);
      return result;
    } catch (err) {
      setError("Failed to process audio chunk");
      console.error("Audio processing error:", err);
      
      // Return dummy data as fallback
      const dummyResponse: AudioProcessingResponse = {
        "Chunk Audio url": "https://example.com/audio.mp3",
        sentence_with_audio_durations: {
          "default_1": ["This is the first sentence.", 3.5],
          "default_2": ["This is the second sentence.", 4.0],
          "default_3": ["This is the third sentence.", 3.0],
          "default_4": ["This is the fourth sentence.", 4.5],
        },
        last_sentence: "This is the fourth sentence.",
        UID: uid
      };
      
      setAudioUrl(dummyResponse["Chunk Audio url"]);
      setSentenceDurations(dummyResponse.sentence_with_audio_durations);
      return dummyResponse;
    }
  };

  return { audioUrl, sentenceDurations, error, processChunk };
};
