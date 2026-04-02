const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Play a sound by its name (wav file in /sounds/)
 */
export function playSound(name: string, volume: number = 1.0) {
  if (!name) return;
  
  // Safety check for NaN or weird values
  const finalVolume = isNaN(volume) ? 1.0 : Math.max(0, Math.min(1, volume));
  
  const soundPath = `/sounds/${name}.wav`;
  const audio = new Audio(soundPath);
  
  audio.volume = finalVolume;
  
  audio.play().catch((err) => {
    if (err.name !== 'NotAllowedError') console.warn('Playback failed:', err);
  });
}

/**
 * Preload a sound into the cache
 */
export function preloadSound(name: string) {
  if (!name || audioCache.has(name)) return;
  const audio = new Audio(`/sounds/${name}.wav`);
  audio.load();
  audioCache.set(name, audio);
}
