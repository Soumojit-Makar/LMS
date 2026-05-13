interface Props { content: string; title?: string }

export default function TextContent({ content, title }: Props) {
  return (
    <div className="card bg-white p-8 max-w-3xl mx-auto">
      {title && <h2 className="font-display text-xl font-bold text-gray-900 mb-6">{title}</h2>}
      <div
        className="prose max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">No content available.</p>' }}
      />
    </div>
  );
}
