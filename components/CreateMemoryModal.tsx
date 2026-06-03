"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ImagePlus, Upload } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { useMemoryStore } from '../hooks/useMemoryStore';

export default function CreateMemoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addDbMemory = useMemoryStore(state => state.addDbMemory);
  const supabase = createClient();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleClose = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);

    const r = 15 + Math.random() * 25;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(fileName, imageFile, { upsert: false });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('memory-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { data, error } = await supabase.from('memory_stars').insert([{
      title, date: date || null, description,
      position_x: x, position_y: y, position_z: z,
      image_url: imageUrl,
    }]).select().single();

    setIsSubmitting(false);

    if (!error && data) {
      addDbMemory({
        id: data.id, title: data.title, date: data.date,
        description: data.description,
        position: [data.position_x, data.position_y, data.position_z],
        constellationId: data.constellation_id,
        image: data.image_url,
        isNew: true,
      });
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="create-memory-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-auto"
          style={{ background: 'radial-gradient(ellipse at center, rgba(80,40,120,0.15) 0%, rgba(0,0,0,0.75) 100%)' }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.96, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full"
            style={{ maxWidth: '680px' }}
          >
            {/* Glass card */}
            <div
              className="relative rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{
                background: 'rgba(8, 6, 18, 0.82)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(120,60,200,0.08)',
              }}
            >
              {/* Subtle top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

              {/* Decorative orbs */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(140,80,220,0.12) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(60,100,220,0.10) 0%, transparent 70%)' }} />

              <div className="relative z-10 p-7">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-serif text-white tracking-wide leading-none">New Memory Star</h2>
                    <p className="text-[11px] text-white/30 mt-1 tracking-widest uppercase font-mono">Immortalise a moment in the sky</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-all duration-150 hover:bg-white/8"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Two-column layout */}
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-5">
                    
                    {/* Left column */}
                    <div className="flex flex-col gap-3">
                      <Field label="Title">
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="A beautiful moment..."
                          className="input-field"
                        />
                      </Field>

                      <Field label="Date">
                        <input
                          type="text"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          placeholder="e.g. October 2023"
                          className="input-field"
                        />
                      </Field>

                      <Field label="Description" grow>
                        <textarea
                          required
                          rows={4}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="Tell the story..."
                          className="input-field resize-none flex-1"
                          style={{ minHeight: 0 }}
                        />
                      </Field>
                    </div>

                    {/* Right column — image uploader */}
                    <div className="flex flex-col gap-3">
                      <Field label="Photo" grow>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />

                        {imagePreview ? (
                          <div className="relative rounded-xl overflow-hidden group flex-1" style={{ minHeight: 0 }}>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                              style={{ background: 'rgba(0,0,0,0.55)' }}
                            >
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="pill-btn">Change</button>
                              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="pill-btn">Remove</button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                            style={{
                              minHeight: 0,
                              borderColor: isDragging ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                              background: isDragging ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            }}
                          >
                            <div className="flex flex-col items-center gap-1.5 text-white/25">
                              {isDragging
                                ? <Upload size={22} className="text-white/50" />
                                : <ImagePlus size={22} />
                              }
                              <span className="text-[10px] font-mono uppercase tracking-widest">
                                {isDragging ? 'Drop to add' : 'Click or drag'}
                              </span>
                              <span className="text-[9px] text-white/15">JPG · PNG · WEBP · GIF</span>
                            </div>
                          </div>
                        )}
                      </Field>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-4">
                    <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                      Your star will appear in the universe
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-semibold tracking-wide text-black transition-all duration-150 disabled:opacity-50 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #e8e8f0, #ffffff)' }}
                    >
                      {isSubmitting
                        ? <><Loader2 className="animate-spin" size={14} /> Saving…</>
                        : 'Save to the Stars ✦'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Scoped styles */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.85);
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.18); }
        .input-field:focus { border-color: rgba(255,255,255,0.18); }
        .pill-btn {
          font-size: 10px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 4px 10px;
          transition: background 0.15s;
          border: none;
          cursor: pointer;
        }
        .pill-btn:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </AnimatePresence>
  );
}

function Field({ label, children, grow }: { label: string; children: React.ReactNode; grow?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${grow ? 'flex-1 min-h-0' : ''}`}>
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/35">{label}</label>
      {children}
    </div>
  );
}
