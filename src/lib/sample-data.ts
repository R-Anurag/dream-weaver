
import type { Board, Proposal } from '@/types';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const sampleBoards: Board[] = [
  {
    id: 'sample-1',
    name: 'Sustainable Urban Farming',
    description: 'A project to bring community gardens to concrete jungles.',
    tags: ['sustainability', 'community', 'urban-farming'],
    published: true,
    thumbnailUrl: '/images/urbanfarming.jpg',
    flairs: ['Featured', 'Top 5%'],
    items: [
        { id: generateId(), type: 'image', x: 50, y: 50, width: 400, height: 300, rotation: -2, content: '/images/urbanfarming.jpg', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 500, y: 80, width: 300, height: 50, rotation: 0, content: 'Community Gardens Initiative', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 24, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'post-it', x: 480, y: 200, width: 250, height: 150, rotation: 5, content: 'Key Goals:\n- 10+ new gardens in 1 year\n- Partner with local schools\n- Secure funding from city grants', style: { backgroundColor: '#FFFACD', color: '#333333', fontFamily: 'Alegreya', fontSize: 16, borderColor: '#000000', borderWidth: 0, textAlign: 'left', shape: 'rectangle' } }
    ],
  },
  {
    id: 'sample-2',
    name: 'AI for Education',
    description: 'Personalized learning paths for all students.',
    tags: ['education', 'ai', 'technology'],
    published: true,
    thumbnailUrl: '/images/aieducation.jpg',
    items: [
        { id: generateId(), type: 'image', x: 450, y: 120, width: 400, height: 300, rotation: 3, content: '/images/aieducation.jpg', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 50, y: 50, width: 350, height: 50, rotation: 0, content: 'AI-Powered Personalized Learning', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 24, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'left' } },
        { id: generateId(), type: 'post-it', x: 80, y: 150, width: 250, height: 150, rotation: -4, content: 'Seeking ML Engineers and Educators to collaborate on creating an adaptive learning platform.', style: { backgroundColor: '#ADD8E6', color: '#333333', fontFamily: 'Alegreya', fontSize: 16, borderColor: '#000000', borderWidth: 0, textAlign: 'left', shape: 'rectangle' } }
    ],
  },
  {
    id: 'sample-3',
    name: 'Ocean Cleanup Initiative',
    description: 'Leveraging drones and AI to clean our oceans.',
    tags: ['environment', 'technology', 'conservation'],
    published: true,
    thumbnailUrl: '/images/oceancleanup.jpg',
     items: [
        { id: generateId(), type: 'image', x: 250, y: 20, width: 500, height: 400, rotation: 0, content: '/images/oceancleanup.jpg', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 50, y: 200, width: 200, height: 100, rotation: -8, content: 'Clean Oceans,\nBlue Future', style: { backgroundColor: 'transparent', color: '#00008B', fontFamily: 'Alegreya', fontSize: 28, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
    ],
  },
  {
    id: 'sample-4',
    name: 'Future of Remote Work',
    description: 'Creating tools for a more connected remote workforce.',
    tags: ['future-of-work', 'saas', 'community'],
    published: true,
    thumbnailUrl: '/images/remotework.jpg',
     items: [
        { id: generateId(), type: 'image', x: 50, y: 50, width: 400, height: 300, rotation: 2, content: '/images/remotework.jpg', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 500, y: 150, width: 300, height: 100, rotation: 0, content: 'The New Remote HQ', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 32, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
    ],
  },
];

export const sampleProposals: Proposal[] = [
    { id: 'prop-1', boardId: 'board-1', boardName: 'My Awesome Project', message: 'Hey, I love your vision for urban farming! I\'m a botanist and would love to help.', from: 'Jane Doe', status: 'pending', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
    { id: 'prop-2', boardId: 'board-1', boardName: 'My Awesome Project', message: 'This is a great idea. I have experience with grant writing and can help secure funding.', from: 'John Smith', status: 'accepted', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
    { id: 'prop-3', boardId: 'board-2', boardName: 'Another Cool Board', message: 'I\'m a UI/UX designer and I have some ideas for how to make this even better.', from: 'Alex Ray', status: 'rejected', timestamp: Date.now() - 1000 * 60 * 60 * 48 },
];
