// The asset label: a printed-sticker look with a small barcode generated from the tag.
// The barcode is decorative (not a real symbology) and hidden from screen readers.

function barsFor(text) {
  const bars = [];
  let x = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    for (let i = 0; i < 3; i += 1) {
      const width = ((code >> i) & 1) + 1;
      bars.push({ x, width });
      x += width + (((code >> (i + 3)) & 1) + 1);
    }
  }
  return { bars, total: x };
}

export default function AssetTag({ tag, size = 'small' }) {
  const { bars, total } = barsFor(tag);
  return (
    <span className={`asset-tag asset-tag-${size}`}>
      <svg className="asset-tag-code" viewBox={`0 0 ${total} 10`} preserveAspectRatio="none" aria-hidden="true">
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="10" />
        ))}
      </svg>
      <span className="asset-tag-text">{tag}</span>
    </span>
  );
}
