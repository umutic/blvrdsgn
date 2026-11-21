import { unsplash } from '@/utils/media';

/**
 * Canlı önizleme sahneleri — gerçek iç mekân fotoğrafları (4:5 kırpılmış).
 * cx/cy: posterin merkezinin sahnedeki konumu (%), cmToPct: 1 cm'nin sahne genişliğine oranı (%).
 * Değerler fotoğraflar 4:5 ızgara üzerinde incelenerek belirlendi.
 */
export const ROOM_SCENES = [
  { id: 'yakin', name: 'Yakın Plan', photo: '1719264891009-bf4dd616758e', cx: 50, cy: 44, cmToPct: 0.75 },
  { id: 'salon', name: 'Salon Köşesi', photo: '1663296766506-f95f7d8c87af', cx: 42, cy: 34, cmToPct: 0.45 },
  { id: 'calisma', name: 'Çalışma Odası', photo: '1779119507174-377fd3d44785', cx: 24, cy: 40, cmToPct: 0.36 },
  { id: 'minimal', name: 'Minimal Oda', photo: '1625585598750-3535fe40efb3', cx: 40, cy: 28, cmToPct: 0.42 },
  { id: 'retro', name: 'Retro Köşe', photo: '1610749396754-d1a480e39ef9', cx: 45, cy: 30, cmToPct: 0.4 },
];

export const sceneImage = (scene, w = 1000) => unsplash(scene.photo, { w, h: Math.round(w * 1.25) });
export const getScene = (id) => ROOM_SCENES.find((s) => s.id === id) ?? ROOM_SCENES[1];
