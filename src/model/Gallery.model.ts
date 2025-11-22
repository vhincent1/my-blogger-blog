export interface GalleryEntry {
  postId: number;
  title: string;
  images: any;
  isNSFW: boolean; // blurr
}

export class Gallery {
  entries: GalleryEntry[];

  constructor(entries: GalleryEntry[]) {
    this.entries = entries;
  }

  getEntries = () => this.entries;

//   toggleBlur = (entries: GalleryEntry[]) => {
//     entries.forEach((entry) => {
//       entry.isNSFW = !entry.isNSFW;
//     });
//     this.entries = entries;
//   };
}
