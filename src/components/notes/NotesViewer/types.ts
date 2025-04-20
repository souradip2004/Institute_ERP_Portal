// Types for the players class
export type PlayerMapping = string;

export type Player = {
  startingvalue: number;
  endingvalue: number;
  image: string;
  audio: string;
  heading: string;
  content: string;
  summary: string;
  mainImage: string;
  duration: number;
  type: boolean;
  ocr: string;
  mappings: PlayerMapping[];
  prev: Player | null;
  next: Player | null;
};

// Types for trial data structure
export type SegmentTranslation = [
  string, // summary
  string, // audioUrl
  number, // duration
  string, // translation
  string[] // mappings
];

export type TextSegments = {
  [key: string]: SegmentTranslation[];
};

export type PageContent = [
  string, // mainImage
  string, // croppedImage
  string, // ocrText
  { [key: string]: SegmentTranslation[] } // segments
];

export type PageItem = {
  [key: string]: {
    [key: string]: PageContent;
  };
};

export type TrialData = PageItem[];

// Props for the NotesViewer component
export interface NotesViewerProps {
  pdfUrl?: string;
  noteId?: string;
  initialVideoData?: any;
}

// State types
export interface NotesViewerState {
  submit: boolean;
  link: string;
  loaded: boolean;
  ready: boolean;
  selectedFile: File | null;
  mainImage: string;
  keypoint: string;
  audioPath: string;
  sideImage: string;
  towrite: string;
  marker: string[];
  values: number;
  isplaying: boolean;
  currenttime: number;
  ocr: string;
  lang: string;
  dataholder: Player | null;
  trialdata: TrialData;
  max: number;
  toDisplay: boolean;
  showControls: boolean;
}
