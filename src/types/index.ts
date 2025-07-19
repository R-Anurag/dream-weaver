export type ItemType = 'text' | 'image' | 'shape' | 'post-it';

export type ShapeType = 'rectangle' | 'circle' | 'star';

export type CanvasItem = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // URL for image, text content for text/post-it
  style: {
    backgroundColor: string;
    color: string;
    fontFamily: string;
    fontSize: number;
    shape: ShapeType;
    borderColor: string;
    borderWidth: number;
    textAlign: 'left' | 'center' | 'right';
  };
};

export type Board = {
  id: string;
  name: string;
  items: CanvasItem[];
};
