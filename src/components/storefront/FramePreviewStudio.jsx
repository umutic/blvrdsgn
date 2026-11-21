'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { RoomComposite } from './RoomComposite';
import { FramedArt } from './FramedArt';
import { ROOM_SCENES, sceneImage } from '@/data/scenes';
import { getFrame, getSize } from '@/utils/pricing';

export { ROOM_SCENES };

/**
 * Canlı çerçeve & oda önizleme stüdyosu. 'eser' görünümü posteri yakından,
 * diğer sahneler gerçek oda fotoğraflarında gerçek ölçekte gösterir.
 */
export function FramePreviewStudio({ product, sizeId, frameId, mat, roomId, onRoomChange }) {
  const scene = ROOM_SCENES.find((r) => r.id === roomId);
  const size = getSize(sizeId);
  const landscape = product.orientation === 'yatay';
  const ratio = landscape ? size.height / size.width : size.width / size.height;

  return (
    <div>
      <div className="relative">
        {scene ? (
          <RoomComposite scene={scene} product={product} sizeId={sizeId} frameId={frameId} mat={mat} sizes="(min-width:1024px) 55vw, 100vw" priority />
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center bg-[radial-gradient(ellipse_at_top,#FBFBF9,#E8E8E6)]">
            <motion.div layout className={landscape ? 'w-[78%]' : 'w-[58%]'} transition={{ type: 'spring', stiffness: 140, damping: 22 }}>
              <FramedArt image={product.image} alt={product.title} frame={getFrame(frameId)} mat={mat} ratio={ratio} thickness="4.5%" sizes="45vw" priority />
            </motion.div>
          </div>
        )}
        <span className="absolute left-4 top-4 flex items-center gap-2 bg-canvas/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur">
          <Maximize2 className="size-3" /> {scene ? `${scene.name} · gerçek ölçek` : 'Eser görünümü'}
        </span>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        <SceneThumb active={!scene} onClick={() => onRoomChange('eser')} label="Eser">
          <Image src={product.image} alt="" fill sizes="80px" className="object-cover p-2" />
        </SceneThumb>
        {ROOM_SCENES.map((r) => (
          <SceneThumb key={r.id} active={r.id === roomId} onClick={() => onRoomChange(r.id)} label={r.name}>
            <Image src={sceneImage(r, 200)} alt="" fill sizes="80px" className="object-cover" />
          </SceneThumb>
        ))}
      </div>
    </div>
  );
}

function SceneThumb({ active, onClick, label, children }) {
  return (
    <button type="button" onClick={onClick} className="group w-20 shrink-0 text-left">
      <span className={`relative block aspect-[4/5] overflow-hidden bg-surface ring-offset-2 transition ${active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'}`}>{children}</span>
      <span className={`mt-1.5 block truncate text-[11px] uppercase tracking-[0.14em] ${active ? 'text-ink' : 'text-muted'}`}>{label}</span>
    </button>
  );
}
