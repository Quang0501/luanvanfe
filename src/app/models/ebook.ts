import { KindOfBook } from './kind-of-book.enum';
import  {EbookImage} from './ebook.image';
import { EbookMp3 } from './ebook.mp3';
export interface Ebook {
    id: number;
    category_id: number;
    name: string;
    title: string;
    kindofbook: KindOfBook; 
    document: string;
    thumbnail: string;
    audioUrl: string;
    evaluate: number;
    price: number;
    url: string;
    ebook_images: EbookImage[];
    ebook_mp3s:EbookMp3[];
    isLoved?: boolean;
  
  }
  
