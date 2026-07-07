import { useRef } from 'react';
import { fileToBase64 } from '../utils/format.js';

/**
 * Picks image files and hands them up as base64 data-URI strings —
 * the format the API expects (it uploads them to Cloudinary server-side).
 *
 * Props:
 *  - images: string[] (base64 or existing URLs, for preview)
 *  - onChange: (images: string[]) => void
 *  - multiple: allow more than one image
 */
export default function ImageUploader({ images = [], onChange, multiple = false }) {
  const inputRef = useRef(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const encoded = await Promise.all(files.map(fileToBase64));
    onChange(multiple ? [...images, ...encoded] : encoded.slice(0, 1));
    event.target.value = ''; // allow re-selecting the same file
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        className="uploader__drop"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        📷 Click to {multiple ? 'add images' : 'choose an image'} (JPG/PNG, &lt;5&nbsp;MB
        each)
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={handleFiles}
      />
      {images.length > 0 && (
        <div className="uploader__previews">
          {images.map((src, i) => (
            <div className="uploader__thumb" key={i}>
              <img src={src} alt={`Upload preview ${i + 1}`} />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove image ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
