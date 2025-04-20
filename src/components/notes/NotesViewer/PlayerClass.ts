import { Player } from "./types";

export class PlayerNode implements Player {
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
  mappings: string[];
  prev: Player | null;
  next: Player | null;

  constructor(
    startingvalue: number,
    endingvalue: number,
    image: string,
    audio: string,
    heading: string,
    content: string,
    summary: string,
    mainImage: string,
    duration: number,
    type: boolean,
    ocr: string,
    mappings: string[]
  ) {
    this.startingvalue = startingvalue;
    this.endingvalue = endingvalue;
    this.image = image;
    this.audio = audio;
    this.heading = heading;
    this.content = content;
    this.summary = summary;
    this.mainImage = mainImage;
    this.duration = duration;
    this.type = type;
    this.ocr = ocr;
    this.mappings = mappings;
    this.prev = null;
    this.next = null;
  }

  setNext(node: PlayerNode | null): void {
    this.next = node;
  }

  setPrev(node: PlayerNode | null): void {
    this.prev = node;
  }

  setData(audio: string, image: string): void {
    this.audio = audio;
    this.image = image;
  }

  getNext(): Player | null {
    return this.next;
  }

  getPrev(): Player | null {
    return this.prev;
  }

  getStartingValue(): number {
    return this.startingvalue;
  }

  getEndingValue(): number {
    return this.endingvalue;
  }

  traverse(value: number): Player | null {
    let current: Player | null = this;
    while (current !== null) {
      if (current.startingvalue <= value && value <= current.endingvalue) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  finddata(value: number): Player | null {
    let current: Player | null = this;
    while (current !== null) {
      if (current.startingvalue <= value && value <= current.endingvalue) {
        return current;
      }
      current = current.next;
    }
    return null;
  }
}
