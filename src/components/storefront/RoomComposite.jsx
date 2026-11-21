'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FramedArt } from './FramedArt';
import { sceneImage } from '@/data/scenes';
import { getFrame, getSize } from '@/utils/pricing';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Gerçek oda fotoğrafı üzerinde, seçilen boyutun gerçek ölçeğine göre konumlanan poster.
 * Sahne 4:5 oranındadır; konum/ölçek data/scenes.js'ten gelir.
 */
export function RoomComposite({ scene, product, sizeId, frameId, mat = false, className = '', sizes = '50vw', priority = false, animateKey }) {
  const size = getSize(sizeId);
  const frame = getFrame(frameId);
  const landscape = product.orientation === 'yatay';
  const widthCm = landscape ? size.height : size.width;
  const ratio = landscape ? size.height / size.width : size.width / size.height;
  const frameCm = frame.finish ? 2.4 : 0;
  const matCm = frame.finish && mat ? widthCm * 0.09 * 2 : 0;
  const widthPct = (widthCm + frameCm * 2 + matCm) * scene.cmToPct;

  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-surface ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={scene.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Image src={sceneImage(scene)} alt={scene.name} fill sizes={sizes} priority={priority} className="object-cover" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="absolute"
        initial={false}
        animate={{ width: `${widthPct}%`, left: `${scene.cx}%`, top: `${scene.cy}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
        style={{ x: '-50%', y: '-50%' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={animateKey ?? product.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <FramedArt
              image={product.image}
              alt={product.title}
              frame={frame}
              mat={mat}
              ratio={ratio}
              thickness={`${(frameCm / (widthCm + frameCm * 2 + matCm)) * 100}%`}
              sizes="30vw"
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
