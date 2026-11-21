/**
 * Çerçeve seçenekleri. price: 21×30 için ek ücret (boyutun frameFactor'ü ile ölçeklenir).
 * finish: önizlemedeki malzeme görünümü (CSS background).
 */
export const FRAMES = [
  { id: 'cercevesiz', name: 'Çerçevesiz', price: 0, color: null, finish: null },
  { id: 'siyah-ahsap', name: 'Siyah Ahşap', price: 190, color: '#1F1F1F', finish: 'linear-gradient(135deg,#3a3a3a 0%,#1b1b1b 45%,#2a2a2a 100%)' },
  { id: 'dogal-mese', name: 'Doğal Meşe', price: 220, color: '#C8A27A', finish: 'repeating-linear-gradient(90deg,rgba(120,80,40,.10) 0 2px,transparent 2px 7px),linear-gradient(135deg,#dcbb93,#c09068 55%,#d4ae84)' },
  { id: 'ceviz', name: 'Ceviz', price: 240, color: '#5C3D2E', finish: 'repeating-linear-gradient(90deg,rgba(0,0,0,.12) 0 2px,transparent 2px 6px),linear-gradient(135deg,#7a5442,#4f3326 55%,#6a4636)' },
  { id: 'beyaz', name: 'Beyaz', price: 190, color: '#F4F3EF', finish: 'linear-gradient(135deg,#ffffff,#ecebe6 60%,#f7f6f2)' },
  { id: 'gold-metal', name: 'Gold Metal', price: 260, color: '#C9A55C', finish: 'linear-gradient(135deg,#efd99b 0%,#b8913f 40%,#e8cf8e 65%,#9c7a33 100%)' },
];

/** Paspartu yalnızca çerçeveli seçeneklerde kullanılabilir. */
export const MAT = { label: 'Paspartu', price: 60 };
