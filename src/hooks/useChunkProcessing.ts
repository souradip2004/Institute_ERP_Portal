export const useChunkProcessing = () => {
    const processChunk = (text: string): string[] => {
      // Split text into sentences
      if (!text) return [];
      
      // Simple sentence splitting logic
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      
      // Clean up and return sentences
      return sentences.map(sentence => sentence.trim());
    };
  
    return { processChunk };
  };
  
  // This function is used to split chunks into lines for display
  export const splitChunksIntoLines = (chunks: string[]): string[] => {
    const lines: string[] = [];
    
    // Process each chunk and add its sentences to lines
    for (const chunk of chunks) {
      // Simple split by period, question mark, exclamation
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [];
      lines.push(...sentences.map(sentence => sentence.trim()));
    }
    
    return lines;
  };
  