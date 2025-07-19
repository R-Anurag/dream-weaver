
import type { Board, Proposal } from '@/types';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const sampleBoards: Board[] = [
  {
    id: 'sample-1',
    name: 'Sustainable Urban Farming',
    description: 'A project to bring community gardens to concrete jungles.',
    tags: ['sustainability', 'community', 'urban-farming'],
    flairs: ['Design', 'Funding', 'Engineering'],
    items: [
        { id: generateId(), type: 'image', x: 50, y: 50, width: 400, height: 300, rotation: -2, content: 'https://placehold.co/800x600', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 500, y: 80, width: 300, height: 50, rotation: 0, content: 'Community Gardens Initiative', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 24, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'post-it', x: 480, y: 200, width: 250, height: 150, rotation: 5, content: 'Key Goals:\n- 10+ new gardens in 1 year\n- Partner with local schools\n- Secure funding from city grants', style: { backgroundColor: '#FFFACD', color: '#333333', fontFamily: 'Alegreya', fontSize: 16, borderColor: '#000000', borderWidth: 0, textAlign: 'left', shape: 'rectangle' } }
    ]
  },
  {
    id: 'sample-2',
    name: 'AI for Education',
    description: 'Personalized learning paths for all students.',
    tags: ['education', 'ai', 'technology'],
    flairs: ['Development', 'Research'],
    items: [
        { id: generateId(), type: 'image', x: 450, y: 120, width: 400, height: 300, rotation: 3, content: 'https://placehold.co/800x600', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 50, y: 50, width: 350, height: 50, rotation: 0, content: 'AI-Powered Personalized Learning', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 24, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'left' } },
        { id: generateId(), type: 'post-it', x: 80, y: 150, width: 250, height: 150, rotation: -4, content: 'Seeking ML Engineers and Educators to collaborate on creating an adaptive learning platform.', style: { backgroundColor: '#ADD8E6', color: '#333333', fontFamily: 'Alegreya', fontSize: 16, borderColor: '#000000', borderWidth: 0, textAlign: 'left', shape: 'rectangle' } }
    ]
  },
  {
    id: 'sample-3',
    name: 'Ocean Cleanup Initiative',
    description: 'Leveraging drones and AI to clean our oceans.',
    tags: ['environment', 'technology', 'conservation'],
    flairs: ['Engineering', 'Marketing', 'Logistics'],
     items: [
        { id: generateId(), type: 'image', x: 250, y: 20, width: 500, height: 400, rotation: 0, content: 'https://placehold.co/800x600', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 50, y: 200, width: 200, height: 100, rotation: -8, content: 'Clean Oceans,\nBlue Future', style: { backgroundColor: 'transparent', color: '#00008B', fontFamily: 'Alegreya', fontSize: 28, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
    ]
  },
  {
    id: 'sample-4',
    name: 'Future of Remote Work',
    description: 'Creating tools for a more connected remote workforce.',
    tags: ['future-of-work', 'saas', 'community'],
    flairs: ['Product', 'Design', 'Marketing'],
     items: [
        { id: generateId(), type: 'image', x: 50, y: 50, width: 400, height: 300, rotation: 2, content: 'https://placehold.co/800x600', style: { backgroundColor: '', color: '', fontFamily: '', fontSize: 16, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
        { id: generateId(), type: 'text', x: 500, y: 150, width: 300, height: 100, rotation: 0, content: 'The New Remote HQ', style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 32, shape: 'rectangle', borderColor: '', borderWidth: 0, textAlign: 'center' } },
    ]
  },
];

export const sampleProposals: Proposal[] = [
  {
    id: 'prop-1',
    boardId: 'sample-1',
    userName: 'Alice Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    message: "I'm a UI/UX designer with 5 years of experience in sustainable tech. I love your vision for urban farming and have some ideas for a companion app. Let's connect!",
    status: 'pending',
    accessLevel: null,
  },
    {
    id: 'prop-1-accepted',
    boardId: 'sample-1',
    userName: 'Dave Smith',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a',
    message: "I'm a seasoned horticulturalist and can provide valuable insights into crop selection and sustainable practices. I've managed three community gardens in the past and would love to help your project succeed.",
    status: 'accepted',
    accessLevel: 'edit',
  },
  {
    id: 'prop-2',
    boardId: 'sample-2',
    userName: 'Bob Williams',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    message: "I'm a software engineer and can help build out the backend for your AI education platform. My background is in machine learning and data science.",
    status: 'pending',
    accessLevel: null,
  },
  {
    id: 'prop-3',
    boardId: 'sample-3',
    userName: 'Charlie Brown',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    message: "Your ocean cleanup initiative is inspiring! I have a background in logistics and grant writing and would love to contribute to the project management.",
    status: 'considering',
    accessLevel: null,
  },
    {
    id: 'prop-3-declined',
    boardId: 'sample-3',
    userName: 'Eve Davis',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
    message: "I'm a marketing specialist and would love to help get the word out about your amazing project!",
    status: 'declined',
    accessLevel: null,
  },
];
