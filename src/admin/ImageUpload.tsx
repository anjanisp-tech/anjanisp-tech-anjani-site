import { useState } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { uploadImage } from './useAdminApi';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/** Reusable cover-image / infographic uploader. Stores the public Blob URL.
 *  Also accepts a pasted URL so existing remote images keep working. */
export default function ImageUpload({ label, value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (ex: any) {
      setErr(ex.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative shrink-0">
            <img src={value} alt={label} className="w-32 h-20 object-cover rounded-xl border border-border" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-1 shadow hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="w-32 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-accent/20 shrink-0">
            <UploadCloud size={22} />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-sm font-bold text-accent cursor-pointer transition-all">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={busy} />
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-accent outline-none transition-all text-sm"
          />
          {err && <p className="text-red-600 text-xs font-bold">{err}</p>}
        </div>
      </div>
    </div>
  );
}
