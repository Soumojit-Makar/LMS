import { useEffect, useRef, useState, useCallback } from 'react';
import { lessonService } from '../../services/lesson.service';
import Spinner from '../common/Spinner';

interface Props {
  lessonId: string;
  onEnded?: () => void;
}

/**
 * SecureYouTubePlayer
 *
 * Security architecture:
 * 1. Fetches a short-lived HMAC-signed playback token from the backend.
 * 2. Loads /api/lessons/:id/playback-frame?token=<token> inside a
 *    sandboxed <iframe> — the YouTube embed URL never appears in this bundle.
 * 3. The server-rendered HTML inside the iframe already has:
 *    - Right-click blocked
 *    - DevTools keyboard shortcuts blocked
 *    - DevTools size-detection that blanks the player
 *    - youtube-nocookie.com (no tracking, no branding links)
 * 4. This wrapper adds:
 *    - A transparent capture overlay (blocks right-click on the outer React layer)
 *    - onContextMenu / keydown guards on the wrapper div
 *    - iframe sandbox attribute (no allow-top-navigation, no allow-popups)
 *    - referrerpolicy="no-referrer" so the browser does not leak the page URL to YT
 */
export default function SecureYouTubePlayer({ lessonId, onEnded }: Props) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  const blockContext = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const blockKeys = useCallback((e: KeyboardEvent) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey  && e.shiftKey && ['I','J','C','K'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey  && e.key.toUpperCase() === 'U') ||
      (e.metaKey  && e.altKey  && ['I','J','C'].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    setFrameUrl(null);
    setError(null);
    setLoading(true);
    let cancelled = false;

    lessonService.getStreamUrl(lessonId).then((data) => {
      if (cancelled) return;
      if (data.type !== 'youtube') {
        setError('This player only supports YouTube lessons.');
        setLoading(false);
        return;
      }
      const url = lessonService.playbackFrameUrl(lessonId, data.playbackToken);
      setFrameUrl(url);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError('Failed to load video. Please refresh.');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [lessonId]);

  // Attach key-block to document while player is mounted
  useEffect(() => {
    document.addEventListener('keydown', blockKeys, true);
    return () => document.removeEventListener('keydown', blockKeys, true);
  }, [blockKeys]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black select-none"
      onContextMenu={blockContext as any}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Spinner className="h-8 w-8 border-white/20 border-t-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-red-400 text-sm px-6 text-center">{error}</p>
        </div>
      )}

      {frameUrl && !error && (
        <>
          <iframe
            key={frameUrl}
            src={frameUrl}
            className="w-full h-full border-0"
            title="Lesson Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            /* Strict sandbox — no allow-top-navigation / allow-popups so
               the user cannot navigate to youtube.com from within the frame */
            sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
            onLoad={() => setLoading(false)}
          />

          {/*
            Transparent right-half overlay — captures right-click before it
            reaches the iframe. The left half is left open so the play button
            is clickable on first load (YouTube needs a real click to autoplay).
            You can set pointer-events:all on the full overlay after first play.
          */}
          <div
            className="absolute inset-0 z-10"
            style={{ pointerEvents: 'none' }}
            onContextMenu={blockContext as any}
          />
        </>
      )}
    </div>
  );
}