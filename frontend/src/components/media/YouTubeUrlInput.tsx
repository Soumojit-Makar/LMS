import { useState, useEffect } from 'react';
import { Youtube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

/** Extracts the 11-char YouTube video ID client-side for thumbnail preview only. */
function extractYtId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export default function YouTubeUrlInput({ value, onChange, error }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  useEffect(() => {
    setThumbLoaded(false);
    const id = value ? extractYtId(value) : null;
    setPreviewId(id);
  }, [value]);

  const isValid = !!previewId;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        YouTube Video URL
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Youtube className="h-5 w-5 text-red-500" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={[
            'block w-full rounded-xl border pl-11 pr-10 py-2.5 text-sm',
            'focus:outline-none focus:ring-2 transition-colors',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
              : isValid
              ? 'border-green-300 focus:border-green-400 focus:ring-green-200'
              : 'border-gray-200 focus:border-brand-500 focus:ring-brand-200',
          ].join(' ')}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <AlertCircle className="h-4 w-4 text-red-400" />
            }
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* Live thumbnail preview — uses only public YouTube thumbnail API, no videoId exposed to students */}
      {previewId && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative aspect-video bg-gray-100">
            {!thumbLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            )}
            <img
              src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
              alt="Video thumbnail preview"
              className="w-full h-full object-cover"
              onLoad={() => setThumbLoaded(true)}
            />
            {thumbLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-3 shadow-lg opacity-90">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-xs text-gray-600 font-medium">
              Valid YouTube video · Preview above is for trainer reference only
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Students will <strong>never</strong> see the YouTube URL.
          The video is served through a secure, time-limited server-side proxy.
          Sharing, inspect-mode links, and source-code access are all blocked on the player.
        </p>
      </div>
    </div>
  );
}