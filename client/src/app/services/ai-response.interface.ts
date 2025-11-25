// Auto-generated Angular interface from res_com.json

export interface GroundingChunk {
  retrievedContext: RetrievedContext;
}

export interface RetrievedContext {
  title: string;
  text: string;
  fileSearchStore: string;
}

export interface GroundingSupport {
  segment: Segment;
  groundingChunkIndices: number[];
}

export interface Segment {
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports: GroundingSupport[];
}

export interface ContentPart {
  text: string;
}

export interface Content {
  parts: ContentPart[];
  role: string;
}

export interface Candidate {
  content: Content;
  finishReason: string;
  groundingMetadata: GroundingMetadata;
}

export interface AIResResponse {
  candidates: Candidate[];
}
