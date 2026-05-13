import { useEffect, useRef, useState } from 'react';
import { lessonService } from '../../services/lesson.service';
import SecureYouTubePlayer from './SecureYouTubePlayer';
import Spinner from '../common/Spinner';

interface Props {
  lessonId: string;
  onEnded?: () => void;
}

/**
 * VideoPlayer — unified player for all lesson types.
 * For YouTube lessons: delegates to SecureYouTubePlayer.
 * For Cloudinary-hosted video: uses a native <video> element with
 *   signed URL and download-prevention attributes.
 */
export default function VideoPlayer({ lessonId, onEnded }: Props) {
  const [type, setType]     = useState<string | null>(null);
  const [src, setSrc]       = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setType(null); setSrc(null); setError(null); setLoading(true);
    let cancelled = false;

    lessonService.getStreamUrl(lessonId).then((data) => {
      if (cancelled) return;
      setType(data.type);
      if (data.type === 'video') setSrc(data.url);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setError('Failed to load video. Try refreshing.'); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [lessonId]);

  // ── YouTube ────────────────────────────────────────────────
  if (type === 'youtube') {
    return <SecureYouTubePlayer lessonId={lessonId} onEnded={onEnded} />;
  }

  // ── Loading / Error ────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center bg-gray-900 rounded-xl aspect-video">
      <Spinner className="h-8 w-8 border-white/20 border-t-white" />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center bg-gray-900 rounded-xl aspect-video">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );
  if (!src) return null;

  // ── Cloudinary native video ────────────────────────────────
  return (
    <video
      src={src}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      onEnded={onEnded}
      className="w-full rounded-xl aspect-video bg-black"
    />
  );
}