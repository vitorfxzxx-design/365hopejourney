import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Headphones, Music, Upload, Save, Trash2, Play, Pause, Volume2, Edit2, X, Check, Image as ImageIcon
} from 'lucide-react';
import { useEbooks, DEFAULT_HEALTH365_AUDIO_COVER } from '../../context/EbookContext';
import { saveAudioToStorage, getAudioFileDuration, getAudioFromStorage } from '../../utils/audioStorage';
import { supabase } from '../../lib/supabase';

export default function AdminAudiosView({ onBack }) {
  const { audios, addAudio, updateAudio, deleteAudio, appSettings, updateAppSettings } = useEbooks();

  const [audioTabActive, setAudioTabActive] = useState(() => {
    try {
      const local = localStorage.getItem('health365_audio_tab_active');
      if (local !== null) return local === 'true';
      return appSettings?.audioTabActive !== undefined ? appSettings.audioTabActive : true;
    } catch (e) {
      return true;
    }
  });

  const [defaultCover, setDefaultCover] = useState(() => {
    try {
      const local = localStorage.getItem('health365_default_audio_cover');
      if (local && !local.startsWith('data:image/svg+xml')) return local;
      const remote = appSettings?.defaultAudioCover;
      if (remote && !remote.startsWith('data:image/svg+xml')) return remote;
      return '';
    } catch (e) {
      return '';
    }
  });

  const [sectionTitle, setSectionTitle] = useState(() => {
    try {
      return localStorage.getItem('health365_audio_section_title') || '';
    } catch (e) {
      return '';
    }
  });

  const audiosList = audios || [];

  // Single Audio Form state
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [newAudioDesc, setNewAudioDesc] = useState('');
  const [newAudioFile, setNewAudioFile] = useState(null);
  const [newAudioCover, setNewAudioCover] = useState('');
  const [newAudioDuration, setNewAudioDuration] = useState('05:00');
  const [isUploadingSingle, setIsUploadingSingle] = useState(false);

  // Edit Audio State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState(null);

  // Audio Preview State for Admin
  const [previewingId, setPreviewingId] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const adminAudioRef = useRef(null);

  // Batch upload state
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState('');

  const defaultCoverInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const audioCoverInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const editAudioFileInputRef = useRef(null);
  const editAudioCoverInputRef = useRef(null);

  const getExactTitleFromFileName = (fileName) => {
    if (!fileName) return 'Audio Track';
    const lastDotIndex = fileName.lastIndexOf('.');
    const rawTitle = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
    return rawTitle.trim();
  };

  const formatSec = (sec) => {
    if (isNaN(sec) || sec === null || sec === undefined || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const getCoverForAudio = (audio) => {
    if (audio?.cover && !audio.cover.includes('unsplash.com') && !audio.cover.startsWith('data:image/svg+xml')) {
      return audio.cover;
    }
    if (defaultCover && !defaultCover.startsWith('data:image/svg+xml')) {
      return defaultCover;
    }
    return '';
  };

  const handleTogglePreview = async (audioId, explicitUrl) => {
    if (previewingId === audioId && isPlayingPreview) {
      adminAudioRef.current?.pause();
      setIsPlayingPreview(false);
      return;
    }

    if (previewingId === audioId && !isPlayingPreview) {
      adminAudioRef.current?.play().catch(() => {});
      setIsPlayingPreview(true);
      return;
    }

    // Switch to new audio
    setPreviewingId(audioId);
    setPreviewCurrentTime(0);

    let src = explicitUrl;
    if (!src || !src.startsWith('data:')) {
      const stored = await getAudioFromStorage(audioId);
      if (stored) {
        src = stored;
      }
    }
    if (!src) {
      const item = audiosList.find(a => a.id === audioId);
      src = item?.audioUrl || '';
    }

    if (adminAudioRef.current && src) {
      adminAudioRef.current.src = src;
      adminAudioRef.current.load();
      adminAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(err => {
        console.warn('Error playing audio preview:', err);
      });
    }
  };

  const handleStopPreview = () => {
    if (adminAudioRef.current) {
      adminAudioRef.current.pause();
      adminAudioRef.current.currentTime = 0;
    }
    setPreviewingId(null);
    setIsPlayingPreview(false);
    setPreviewCurrentTime(0);
  };

  const handleToggleAudioTab = () => {
    const nextState = !audioTabActive;
    setAudioTabActive(nextState);
    localStorage.setItem('health365_audio_tab_active', String(nextState));
    if (updateAppSettings) {
      updateAppSettings({ audioTabActive: nextState });
    }
  };

  const handleDefaultCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 400, 400, 0.8);
      if (base64) {
        setDefaultCover(base64);
        localStorage.setItem('health365_default_audio_cover', base64);
        updateAppSettings({ defaultAudioCover: base64 });
        // Automatically apply to all registered audios
        audiosList.forEach(audio => {
          updateAudio(audio.id, { ...audio, cover: base64 });
        });
      }
    } catch (err) {
      console.warn('Error compressing default audio cover:', err);
    }
  };

  const handleApplyDefaultCoverToAll = () => {
    if (!defaultCover) {
      alert('Please upload a default cover image first.');
      return;
    }
    updateAppSettings({ defaultAudioCover: defaultCover });
    audiosList.forEach(audio => {
      updateAudio(audio.id, { ...audio, cover: defaultCover });
    });
    alert('Default cover applied to all audios successfully!');
  };

  const handleSaveSectionTitle = () => {
    localStorage.setItem('health365_audio_section_title', sectionTitle);
    updateAppSettings({ audioSectionTitle: sectionTitle });
    alert('Section title saved successfully!');
  };

  const handleAudioCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewAudioCover(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAudioFile(file);
    if (!newAudioTitle) {
      setNewAudioTitle(getExactTitleFromFileName(file.name));
    }
    try {
      const dur = await getAudioFileDuration(file);
      if (dur) setNewAudioDuration(dur);
    } catch (err) {
      console.warn('Error detecting audio duration:', err);
    }
  };

  const handleCreateAudio = async (e) => {
    e.preventDefault();
    if (!newAudioTitle.trim()) {
      alert('Please enter a title for the audio.');
      return;
    }

    setIsUploadingSingle(true);

    try {
      let finalAudioUrl = '';
      let calculatedDuration = newAudioDuration || '05:00';
      const newId = 'audio-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

      if (newAudioFile) {
        try {
          const detectedDur = await getAudioFileDuration(newAudioFile);
          if (detectedDur) calculatedDuration = detectedDur;
          
          // 1. Try uploading directly to Supabase Storage bucket 'audios'
          const fileExt = newAudioFile.name.split('.').pop() || 'mp3';
          const storagePath = `tracks/${newId}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from('audios')
            .upload(storagePath, newAudioFile, {
              contentType: newAudioFile.type || 'audio/mpeg',
              cacheControl: '3600',
              upsert: true
            });

          if (!uploadErr) {
            const { data: publicData } = supabase.storage.from('audios').getPublicUrl(storagePath);
            if (publicData?.publicUrl) {
              finalAudioUrl = publicData.publicUrl;
            }
          }

          // 2. Also keep in IndexedDB as immediate local buffer
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(newAudioFile);
          });
          if (dataUrl) {
            if (!finalAudioUrl) finalAudioUrl = dataUrl;
            await saveAudioToStorage(newId, dataUrl);
          }
        } catch (err) {
          console.warn('Audio processing error:', err);
        }
      }

      const newAudio = {
        id: newId,
        title: newAudioTitle.trim(),
        description: newAudioDesc.trim(),
        audioUrl: finalAudioUrl,
        cover: newAudioCover || defaultCover || '',
        duration: calculatedDuration
      };

      await addAudio(newAudio);

      setNewAudioTitle('');
      setNewAudioDesc('');
      setNewAudioCover('');
      setNewAudioFile(null);
      setNewAudioDuration('05:00');
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
      if (audioCoverInputRef.current) audioCoverInputRef.current.value = '';
      alert('Audio uploaded and added successfully!');
    } finally {
      setIsUploadingSingle(false);
    }
  };

  const handleOpenEdit = (audio) => {
    setEditingAudio({
      ...audio,
      cover: audio.cover || defaultCover || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAudio || !editingAudio.title.trim()) return;

    if (editingAudio.audioUrl && editingAudio.audioUrl.startsWith('data:')) {
      await saveAudioToStorage(editingAudio.id, editingAudio.audioUrl);
    }

    updateAudio(editingAudio.id, editingAudio);
    setEditModalOpen(false);
    setEditingAudio(null);
    alert('Audio changes saved successfully!');
  };

  const handleEditCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingAudio(prev => ({ ...prev, cover: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dur = await getAudioFileDuration(file);
      const newId = editingAudio?.id || ('audio-' + Date.now());
      let cloudUrl = '';

      // Try Supabase Storage upload
      try {
        const fileExt = file.name.split('.').pop() || 'mp3';
        const storagePath = `tracks/${newId}.${fileExt}`;
        const { error: upErr } = await supabase.storage
          .from('audios')
          .upload(storagePath, file, { cacheControl: '3600', upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from('audios').getPublicUrl(storagePath);
          if (pub?.publicUrl) cloudUrl = pub.publicUrl;
        }
      } catch (e) {}

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          await saveAudioToStorage(newId, dataUrl);
        }
        setEditingAudio(prev => ({
          ...prev,
          fileName: file.name,
          audioUrl: cloudUrl || dataUrl,
          duration: dur || prev.duration
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Error reading replacement audio file:', err);
    }
  };

  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBatchUploading(true);

    try {
      let count = 0;
      for (const file of files) {
        count++;
        const exactTitle = getExactTitleFromFileName(file.name);
        setBatchProgressText(`Uploading ${count} of ${files.length}: "${exactTitle}"`);

        const id = 'audio-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        let dur = '05:00';
        let audioUrl = '';

        try {
          dur = await getAudioFileDuration(file);

          // 1. Try Supabase Storage upload
          const fileExt = file.name.split('.').pop() || 'mp3';
          const storagePath = `tracks/${id}.${fileExt}`;
          const { error: upErr } = await supabase.storage
            .from('audios')
            .upload(storagePath, file, {
              contentType: file.type || 'audio/mpeg',
              cacheControl: '3600',
              upsert: true
            });
          if (!upErr) {
            const { data: pub } = supabase.storage.from('audios').getPublicUrl(storagePath);
            if (pub?.publicUrl) audioUrl = pub.publicUrl;
          }

          // 2. Keep local buffer
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (dataUrl) {
            if (!audioUrl) audioUrl = dataUrl;
            await saveAudioToStorage(id, dataUrl);
          }
        } catch (err) {
          console.warn('Error reading batch audio:', err);
        }

        await addAudio({
          id,
          title: exactTitle,
          description: '',
          audioUrl,
          cover: defaultCover || '',
          duration: dur
        });
      }

      if (batchInputRef.current) batchInputRef.current.value = '';
      alert(`Success! ${files.length} audio file(s) uploaded with their exact original names.`);
    } finally {
      setBatchUploading(false);
      setBatchProgressText('');
    }
  };

  const handleDeleteAudio = async (id) => {
    if (window.confirm('Are you sure you want to delete this audio?')) {
      await deleteAudio(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top bar matching Screenshot 1 */}
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Audios - Health365
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage audio tracks and sessions available in the app
          </p>
        </div>

        {/* 1. Aba de Áudios no app */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Headphones size={20} className="text-slate-600" />
            <div>
              <h3 className="font-bold text-xs text-slate-900">
                Audios tab in app
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When enabled, appears between Specialists and NutriPhoto in the app navigation menu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAudioTab}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
              audioTabActive ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                audioTabActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Capa padrão dos áudios */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-900">
              Default audio cover
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              This artwork will be used for all audio tracks that do not have their own custom cover.
            </p>
          </div>

          <input
            type="file"
            ref={defaultCoverInputRef}
            accept="image/*"
            onChange={handleDefaultCoverUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                onClick={() => defaultCoverInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden shrink-0 hover:border-blue-400"
              >
                {defaultCover ? (
                  <img src={defaultCover} alt="Default Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl select-none">{appSettings?.iconEmoji || '🍏'}</span>
                )}
              </div>

              <div
                onClick={() => defaultCoverInputRef.current?.click()}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 bg-white text-xs text-slate-600 flex items-center gap-3 cursor-pointer hover:bg-slate-50"
              >
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg text-xs"
                >
                  Choose file
                </button>
                <span className="text-[11px] text-slate-400 truncate">
                  {defaultCover ? 'Cover artwork uploaded' : 'No file chosen'}
                </span>
              </div>
            </div>

            {defaultCover && (
              <button
                type="button"
                onClick={handleApplyDefaultCoverToAll}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Check size={14} />
                Apply to all audios
              </button>
            )}
          </div>
        </div>

        {/* 3. Título da seção (opcional) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-900">
              Section title (optional)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Appears above the audio track list in the members area. Leave blank to use default ("Audios").
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Guided Meditations"
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
            <button
              onClick={handleSaveSectionTitle}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* 4. Adicionar novo áudio */}
        <form onSubmit={handleCreateAudio} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-xs text-slate-900">
            Add new audio
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={newAudioTitle}
              onChange={(e) => setNewAudioTitle(e.target.value)}
              placeholder="e.g. Morning Reset Meditation"
              className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={newAudioDesc}
              onChange={(e) => setNewAudioDesc(e.target.value)}
              placeholder="Brief description or playback instructions..."
              className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Upload Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Audio file (mp3, wav, m4a...) *
              </label>
              <input
                type="file"
                ref={audioFileInputRef}
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />
              <div
                onClick={() => audioFileInputRef.current?.click()}
                className="border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-xs text-slate-600 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button type="button" className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shrink-0">
                    Choose file
                  </button>
                  <span className="text-[11px] text-slate-600 font-medium truncate">
                    {newAudioFile ? newAudioFile.name : 'No file chosen'}
                  </span>
                </div>
                {newAudioFile && newAudioDuration && (
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                    {newAudioDuration}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cover (optional)
              </label>
              <input
                type="file"
                ref={audioCoverInputRef}
                accept="image/*"
                onChange={handleAudioCoverUpload}
                className="hidden"
              />
              <div
                onClick={() => audioCoverInputRef.current?.click()}
                className="border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-xs text-slate-600 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {newAudioCover ? (
                    <img src={newAudioCover} alt="Cover preview" className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <button type="button" className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shrink-0">
                      Choose file
                    </button>
                  )}
                  <span className="text-[11px] text-slate-600 font-medium truncate">
                    {newAudioCover ? 'Custom cover selected' : (defaultCover ? 'Default cover will be used' : 'No file chosen')}
                  </span>
                </div>
                {newAudioCover && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                    Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploadingSingle}
            className={`bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isUploadingSingle ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isUploadingSingle ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Audio...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload Audio</span>
              </>
            )}
          </button>
        </form>

        {/* 5. Upload em lote */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-900">
              Batch upload
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select multiple audio files at once. Each audio title will automatically match the file name.
            </p>
          </div>

          <input
            type="file"
            ref={batchInputRef}
            multiple
            accept="audio/*"
            onChange={handleBatchUpload}
            className="hidden"
          />

          <div
            onClick={() => !batchUploading && batchInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
              batchUploading
                ? 'border-blue-300 bg-blue-50/50 cursor-wait'
                : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer'
            }`}
          >
            {batchUploading ? (
              <>
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin my-1" />
                <span className="text-xs font-bold text-blue-700">{batchProgressText}</span>
                <span className="text-[10px] text-slate-400">Saving files & detecting track durations...</span>
              </>
            ) : (
              <>
                <Upload size={22} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Click to select multiple audio files</span>
                <span className="text-[10px] text-slate-400">Each track title will exactly preserve your file's name</span>
              </>
            )}
          </div>
        </div>

        {/* 6. Lista de Áudios Atuais */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs text-slate-900">
            Registered Audios ({audiosList.length})
          </h3>

          <div className="space-y-2">
            {audiosList.map((audio) => (
              <div
                key={audio.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  previewingId === audio.id && isPlayingPreview
                    ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative group shrink-0 w-11 h-11 rounded-xl bg-emerald-50/60 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {getCoverForAudio(audio) ? (
                      <img
                        src={getCoverForAudio(audio)}
                        alt={audio.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xl drop-shadow-xs select-none">
                        {appSettings?.iconEmoji || '🍏'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTogglePreview(audio.id, audio.audioUrl)}
                      className={`absolute inset-0 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        previewingId === audio.id && isPlayingPreview
                          ? 'bg-blue-600/80 text-white opacity-100'
                          : 'bg-slate-900/40 text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title={previewingId === audio.id && isPlayingPreview ? 'Pause' : 'Play & Listen'}
                    >
                      {previewingId === audio.id && isPlayingPreview ? (
                        <Pause size={16} className="fill-current" />
                      ) : (
                        <Play size={16} className="fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{audio.title}</h4>
                      {previewingId === audio.id && isPlayingPreview && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 animate-pulse shrink-0">
                          Playing preview
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{audio.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono mr-1">{audio.duration}</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(audio.id, audio.audioUrl)}
                    className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                      previewingId === audio.id && isPlayingPreview
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-white border-transparent hover:border-slate-200'
                    }`}
                    title={previewingId === audio.id && isPlayingPreview ? 'Pause audio' : 'Listen audio'}
                  >
                    {previewingId === audio.id && isPlayingPreview ? (
                      <Pause size={14} className="fill-current" />
                    ) : (
                      <Play size={14} className="fill-current" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(audio)}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Edit Audio"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAudio(audio.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Delete Audio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Audio Full Modal */}
      {editModalOpen && editingAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Audio</h3>
                  <p className="text-[11px] text-slate-400">Update audio details, change media file or cover photo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleStopPreview();
                  setEditModalOpen(false);
                  setEditingAudio(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Cover Photo Preview & Edit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Audio Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={editingAudio.cover || defaultCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
                    alt={editingAudio.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={editAudioCoverInputRef}
                      accept="image/*"
                      onChange={handleEditCoverUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editAudioCoverInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon size={14} />
                      Change Cover Photo
                    </button>
                    <p className="text-[10px] text-slate-400">Recommended square 1:1 image (PNG, JPG, WebP)</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Audio Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingAudio.title}
                  onChange={(e) => setEditingAudio({ ...editingAudio, title: e.target.value })}
                  placeholder="e.g. Guided Anti-Inflammatory Meditation"
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  value={editingAudio.description || ''}
                  onChange={(e) => setEditingAudio({ ...editingAudio, description: e.target.value })}
                  placeholder="e.g. Listen in the morning on an empty stomach..."
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Duration & Audio File */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Duration (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={editingAudio.duration || '08:30'}
                    onChange={(e) => setEditingAudio({ ...editingAudio, duration: e.target.value })}
                    placeholder="e.g. 08:30"
                    className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Replace Audio File
                  </label>
                  <input
                    type="file"
                    ref={editAudioFileInputRef}
                    accept="audio/*"
                    onChange={handleEditAudioFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => editAudioFileInputRef.current?.click()}
                    className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="text-[11px] font-bold text-slate-700 truncate">
                      {editingAudio.fileName ? editingAudio.fileName : 'Choose file...'}
                    </span>
                    <Upload size={13} className="text-slate-400 shrink-0 ml-1" />
                  </div>
                </div>
              </div>

              {/* Preview and Listen Audio Box inside Modal */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Headphones size={13} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Listen & Verify Audio</h4>
                      <p className="text-[10px] text-slate-500">Play this track to verify sound before saving</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {formatSec(previewCurrentTime)} / {formatSec(previewDuration || (adminAudioRef.current?.duration) || 0) !== '0:00' ? formatSec(previewDuration || adminAudioRef.current?.duration) : editingAudio.duration || '0:00'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(editingAudio.id, editingAudio.audioUrl)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${
                      previewingId === editingAudio.id && isPlayingPreview
                        ? 'bg-blue-600 text-white hover:bg-blue-700 ring-3 ring-blue-500/20'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {previewingId === editingAudio.id && isPlayingPreview ? (
                      <>
                        <Pause size={13} className="fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="fill-current ml-0.5" />
                        <span>Play Audio</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1">
                    <div
                      className="w-full bg-slate-200/90 h-2.5 rounded-full overflow-hidden cursor-pointer relative"
                      onClick={(e) => {
                        if (adminAudioRef.current && adminAudioRef.current.duration) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                          adminAudioRef.current.currentTime = ratio * adminAudioRef.current.duration;
                          setPreviewCurrentTime(ratio * adminAudioRef.current.duration);
                        }
                      }}
                    >
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${
                            (previewDuration || adminAudioRef.current?.duration)
                              ? Math.min(100, (previewCurrentTime / (previewDuration || adminAudioRef.current?.duration)) * 100)
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleStopPreview();
                    setEditModalOpen(false);
                    setEditingAudio(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Audio Player for Admin Previews */}
      <audio
        ref={adminAudioRef}
        onTimeUpdate={() => {
          if (adminAudioRef.current) {
            setPreviewCurrentTime(adminAudioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (adminAudioRef.current && adminAudioRef.current.duration && !isNaN(adminAudioRef.current.duration)) {
            setPreviewDuration(adminAudioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlayingPreview(false);
          setPreviewCurrentTime(0);
        }}
      />
    </div>
  );
}
