import React, { useEffect, useState } from 'react';
import { Advertisement, AdPosition } from '../types';
import { api } from '../utils/api';

interface AdBannerProps {
  position: AdPosition;
  advertisements?: Advertisement[];
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, advertisements, className = '' }) => {
  const [activeAd, setActiveAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    if (advertisements && advertisements.length > 0) {
      const matching = advertisements.filter((a) => a.position === position && a.isActive);
      if (matching.length > 0) {
        // Pick one (or random)
        const randomAd = matching[Math.floor(Math.random() * matching.length)];
        setActiveAd(randomAd);
      } else {
        setActiveAd(null);
      }
    } else {
      // Fetch specifically
      api
        .getAdvertisements(position)
        .then((ads) => {
          if (ads.length > 0) {
            setActiveAd(ads[Math.floor(Math.random() * ads.length)]);
          }
        })
        .catch(() => {});
    }
  }, [position, advertisements]);

  if (!activeAd) return null;

  const handleClick = () => {
    if (activeAd.id) {
      api.recordAdClick(activeAd.id).catch(() => {});
    }
  };

  return (
    <div
      id={`ad-container-${position}`}
      className={`ad-banner relative overflow-hidden bg-white border border-gray-200 rounded-lg p-2 text-center shadow-xs ${className}`}
    >
      <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 font-sans">বিজ্ঞাপন</div>
      {activeAd.type === 'code' && activeAd.htmlCode ? (
        <div
          dangerouslySetInnerHTML={{ __html: activeAd.htmlCode }}
          className="overflow-x-auto flex justify-center items-center min-h-[60px]"
        />
      ) : activeAd.imageUrl ? (
        <a
          href={activeAd.destinationUrl || '#'}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={handleClick}
          className="inline-block max-w-full hover:opacity-95 transition-opacity"
        >
          <img
            src={activeAd.imageUrl}
            alt={activeAd.title || 'বিজ্ঞাপন'}
            className="max-h-24 md:max-h-28 w-auto mx-auto object-contain rounded"
            loading="lazy"
          />
        </a>
      ) : null}
    </div>
  );
};
