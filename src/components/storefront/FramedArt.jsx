import Image from 'next/image';

/**
 * Çerçeveli eser. Genişliği ebeveyn belirler; yükseklik ratio'dan gelir.
 * thickness: çerçeve kalınlığı (CSS uzunluğu; % değerleri kapsayıcı genişliğine göredir).
 */
export function FramedArt({ image, alt = '', frame, mat = false, ratio = 3 / 4, thickness = '5%', sizes = '40vw', priority = false, className = '', style }) {
  const framed = Boolean(frame?.finish);
  const showMat = framed && mat;

  return (
    <div
      className={`relative ${className}`}
      style={{
        padding: framed ? thickness : 0,
        background: framed ? frame.finish : 'transparent',
        boxShadow: framed
          ? '0 30px 50px -22px rgba(0,0,0,.55), 0 10px 18px -8px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.08)'
          : '0 22px 40px -22px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.12)',
        ...style,
      }}
    >
      <div
        className="relative"
        style={{
          padding: showMat ? '9%' : 0,
          background: showMat ? '#FBFBFA' : 'transparent',
          boxShadow: framed ? 'inset 0 2px 6px rgba(0,0,0,.35)' : 'none',
        }}
      >
        <div className="relative w-full overflow-hidden bg-surface" style={{ aspectRatio: ratio, boxShadow: showMat ? 'inset 0 1px 3px rgba(0,0,0,.25)' : 'none' }}>
          {image && <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />}
        </div>
      </div>
    </div>
  );
}
