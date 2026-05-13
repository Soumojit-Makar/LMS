import { FileText, Download, ExternalLink } from 'lucide-react';

interface Props {
  url:       string;
  filename?: string;
  height?:   string;
}

export default function PdfViewer({ url, filename = 'document.pdf', height = '640px' }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <FileText className="h-5 w-5 text-brand-600" />
        <span className="font-medium text-sm text-gray-900 flex-1 truncate">{filename}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs py-1.5 px-3 gap-1 shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open
        </a>
        <a href={url} download={filename} className="btn-primary text-xs py-1.5 px-3 gap-1 shrink-0">
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        title={filename}
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}
