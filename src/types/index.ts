
export type ItemType = 'text' | 'image' | 'shape' | 'post-it' | 'drawing';

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
    // For drawings
    strokeColor?: string;
    strokeWidth?: number;
    points?: [number, number][];
  };
};

export type Board = {
  id: string;
  name: string;
  items: CanvasItem[];
  userId?: string;
  description?: string;
  tags?: string[];
  flairs?: string[];
  published?: boolean;
  thumbnailUrl?: string;
};

export type AccessLevel = 'view' | 'comment' | 'edit';

export type Proposal = {
    id: string;
    boardId: string;
    userName: string;
    userAvatar: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined' | 'considering';
    accessLevel: AccessLevel | null;
};
