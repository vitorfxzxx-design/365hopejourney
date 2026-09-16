import React, { useState } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical,
  ExternalLink, FileText
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import EbookModal from './EbookModal';
import ChapterModal from './ChapterModal';

export default function AdminProductsView({ onBack }) {
  const {
    ebooks,
    reorderEbooks,
    addEbook,
    updateEbook,
    deleteEbook,
    addChapter,
    updateChapter,
    deleteChapter
  } = useEbooks();

  const safeEbooks = Array.isArray(ebooks) ? ebooks.filter(b => b && b.id) : [];

  // Keep first module opened by default (Ancestral Diet)
  const [expandedEbookId, setExpandedEbookId] = useState(() => {
    return safeEbooks.find(b => b.category !== 'Supplement' && b.category !== 'Suplemento')?.id || null;
  });

  // Modals
  const [ebookModalOpen, setEbookModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [activeParentEbookId, setActiveParentEbookId] = useState(null);

  // Drag and drop state
  const [draggedChapter, setDraggedChapter] = useState(null); // { ebookId, index }
  const [dragOverChapterKey, setDragOverChapterKey] = useState(null); // `${ebookId}-${index}`

  const [draggedProduct, setDraggedProduct] = useState(null); // { id, isSupplement, index }
  const [dragOverProductKey, setDragOverProductKey] = useState(null); // productId

  const suplementos = safeEbooks.filter(b => b.category === 'Supplement' || b.category === 'Suplemento');
  const modulos = safeEbooks.filter(b => b.category !== 'Supplement' && b.category !== 'Suplemento');

  // Drag & Drop for Chapters (Contents)
  const handleChapterDragStart = (e, ebookId, index) => {
    e.stopPropagation();
    setDraggedChapter({ ebookId, index });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'chapter', ebookId, index }));
    } catch {
      // fallback
    }
  };

  const handleChapterDragOver = (e, ebookId, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedChapter || draggedChapter.ebookId !== ebookId) return;
    e.dataTransfer.dropEffect = 'move';
    const key = `${ebookId}-${index}`;
    if (dragOverChapterKey !== key) {
      setDragOverChapterKey(key);
    }
  };

  const handleChapterDragLeave = (e, ebookId, index) => {
    e.stopPropagation();
    const key = `${ebookId}-${index}`;
    if (dragOverChapterKey === key) {
      setDragOverChapterKey(null);
    }
  };

  const handleChapterDrop = (e, ebookId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverChapterKey(null);

    if (!draggedChapter || draggedChapter.ebookId !== ebookId) return;
    const sourceIndex = draggedChapter.index;
    if (sourceIndex === targetIndex) return;

    const targetEbook = ebooks.find(b => b.id === ebookId);
    if (!targetEbook || !targetEbook.chapters) return;

    const newChapters = [...targetEbook.chapters];
    const [moved] = newChapters.splice(sourceIndex, 1);
    newChapters.splice(targetIndex, 0, moved);

    // Renumber chapters sequentially
    const renumbered = newChapters.map((ch, i) => ({
      ...ch,
      number: i + 1
    }));

    updateEbook(ebookId, { chapters: renumbered });
    setDraggedChapter(null);
  };

  const handleChapterDragEnd = (e) => {
    e.stopPropagation();
    setDraggedChapter(null);
    setDragOverChapterKey(null);
  };

  // Move Product (1-click Up/Down)
  const handleMoveProduct = (isSupplement, fromIndex, direction, e) => {
    e?.stopPropagation();
    const list = isSupplement ? [...suplementos] : [...modulos];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= list.length) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    const merged = isSupplement ? [...list, ...modulos] : [...suplementos, ...list];
    reorderEbooks(merged);
  };

  // Move Chapter (1-click Up/Down)
  const handleMoveChapter = (ebookId, fromIndex, direction, e) => {
    e?.stopPropagation();
    const targetEbook = ebooks.find(b => b.id === ebookId);
    if (!targetEbook || !targetEbook.chapters) return;

    const chapters = [...targetEbook.chapters];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= chapters.length) return;

    const [moved] = chapters.splice(fromIndex, 1);
    chapters.splice(toIndex, 0, moved);

    const renumbered = chapters.map((ch, i) => ({ ...ch, number: i + 1 }));
    updateEbook(ebookId, { chapters: renumbered });
  };

  // Drag & Drop for Products (Modules / Supplements)
  const handleProductDragStart = (e, product, isSupplement, index) => {
    setDraggedProduct({ id: product.id, isSupplement, index });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'product', id: product.id, isSupplement, index }));
    } catch {
      // fallback
    }
  };

  const handleProductDragOver = (e, isSupplement, index, productId) => {
    e.preventDefault();
    if (!draggedProduct || draggedProduct.isSupplement !== isSupplement) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProductKey !== productId) {
      setDragOverProductKey(productId);
    }
  };

  const handleProductDragLeave = (productId) => {
    if (dragOverProductKey === productId) {
      setDragOverProductKey(null);
    }
  };

  const handleProductDrop = (e, isSupplement, targetIndex) => {
    e.preventDefault();
    setDragOverProductKey(null);

    if (!draggedProduct || draggedProduct.isSupplement !== isSupplement) return;
    const sourceIndex = draggedProduct.index;
    if (sourceIndex === targetIndex) return;

    if (isSupplement) {
      const newSuplementos = [...suplementos];
      const [moved] = newSuplementos.splice(sourceIndex, 1);
      newSuplementos.splice(targetIndex, 0, moved);
      const merged = [...newSuplementos, ...modulos];
      reorderEbooks(merged);
    } else {
      const newModulos = [...modulos];
      const [moved] = newModulos.splice(sourceIndex, 1);
      newModulos.splice(targetIndex, 0, moved);
      const merged = [...suplementos, ...newModulos];
      reorderEbooks(merged);
    }

    setDraggedProduct(null);
  };

  const handleProductDragEnd = () => {
    setDraggedProduct(null);
    setDragOverProductKey(null);
  };

  // Ebook Actions
  const handleOpenNewProduct = () => {
    setEditingEbook(null);
    setEbookModalOpen(true);
  };

  const handleEditProduct = (product, e) => {
    e?.stopPropagation();
    setEditingEbook(product);
    setEbookModalOpen(true);
  };

  const handleToggleProduct = (product, e) => {
    e?.stopPropagation();
    updateEbook(product.id, { isActive: !product.isActive });
  };

  const handleDeleteProduct = (productId, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product and all its contents?')) {
      deleteEbook(productId);
    }
  };

  const handleSaveProduct = (formData) => {
    if (editingEbook) {
      updateEbook(editingEbook.id, formData);
    } else {
      addEbook(formData);
    }
  };

  // Chapter Actions
  const handleAddChapter = (ebookId, e) => {
    e?.stopPropagation();
    setActiveParentEbookId(ebookId);
    setEditingChapter(null);
    setChapterModalOpen(true);
  };

  const handleEditChapter = (ebookId, chapter, e) => {
    e?.stopPropagation();
    setActiveParentEbookId(ebookId);
    setEditingChapter(chapter);
    setChapterModalOpen(true);
  };

  const handleDeleteChapter = (ebookId, chapterId, chapterIndex, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this content item?')) {
      deleteChapter(ebookId, chapterId, chapterIndex);
    }
  };

  const handleSaveChapter = (formData) => {
    if (!activeParentEbookId) return;
    if (editingChapter) {
      updateChapter(activeParentEbookId, editingChapter.id, formData);
    } else {
      addChapter(activeParentEbookId, formData);
    }
  };

  const renderProductItem = (product, index, isSupplement) => {
    const isExpanded = expandedEbookId === product.id;
    const contents = product.chapters || [];
    const contentsCount = contents.length;
    const isProductDragging = draggedProduct?.id === product.id;
    const isProductOver = dragOverProductKey === product.id && !isProductDragging;
    const maxIndex = isSupplement ? suplementos.length - 1 : modulos.length - 1;

    return (
      <div
        key={product.id}
        draggable
        onDragStart={(e) => handleProductDragStart(e, product, isSupplement, index)}
        onDragOver={(e) => handleProductDragOver(e, isSupplement, index, product.id)}
        onDragLeave={() => handleProductDragLeave(product.id)}
        onDrop={(e) => handleProductDrop(e, isSupplement, index)}
        onDragEnd={handleProductDragEnd}
        className={`bg-white rounded-2xl border transition-all overflow-hidden ${
          isProductOver
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md translate-y-[-1px]'
            : isProductDragging
            ? 'opacity-40 border-blue-300 border-dashed scale-[0.99]'
            : 'border-slate-200/90 shadow-xs hover:border-slate-300'
        }`}
      >
        {/* Main Product Bar */}
        <div
          onClick={() => setExpandedEbookId(isExpanded ? null : product.id)}
          className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          {/* Left: Drag dots + Reorder Arrows + Image + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex flex-col items-center justify-center shrink-0 -space-y-1.5 py-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={index === 0}
                onClick={(e) => handleMoveProduct(isSupplement, index, -1, e)}
                className="text-slate-300 hover:text-blue-600 disabled:opacity-0 p-0.5 rounded transition-colors"
                title="Move module up"
              >
                <ChevronUp size={13} />
              </button>
              <span
                className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                title="Drag to reorder product"
              >
                <GripVertical size={16} />
              </span>
              <button
                type="button"
                disabled={index === maxIndex}
                onClick={(e) => handleMoveProduct(isSupplement, index, 1, e)}
                className="text-slate-300 hover:text-blue-600 disabled:opacity-0 p-0.5 rounded transition-colors"
                title="Move module down"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
              <img
                src={product.coverImage || product.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80';
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-slate-900 truncate">{product.title}</h4>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md shrink-0">
                  {product.type || 'Main'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Release: {product.releaseType === 'Days After Purchase' || product.releaseType === 'Dias após a compra'
                  ? `${product.daysAfterPurchase || 7} Days After Purchase`
                  : (product.releaseType || 'Immediate')}
              </p>
            </div>
          </div>

          {/* Right: Toggle Switch + Edit + Delete */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Toggle Switch */}
            <button
              type="button"
              onClick={(e) => handleToggleProduct(product, e)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                product.isActive !== false ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  product.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <button
              onClick={(e) => handleEditProduct(product, e)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit Product"
            >
              <Edit2 size={15} />
            </button>

            <button
              onClick={(e) => handleDeleteProduct(product.id, e)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
              title="Delete Product"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Contents Count & Toggle Bottom Bar */}
        <div
          onClick={() => setExpandedEbookId(isExpanded ? null : product.id)}
          className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 cursor-pointer hover:bg-slate-100/50 transition-colors"
        >
          <span className="font-medium text-[11px]">
            {contentsCount} {contentsCount === 1 ? 'content item' : 'content items'}
          </span>
          <button className="text-slate-400">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expandable Module / Contents List */}
        {isExpanded && (
          <div className="bg-slate-50/40 border-t border-slate-200/80 p-4 sm:p-6 space-y-4">
            {/* Header: Contents + Blue Button "+ New Content" */}
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs text-slate-800 tracking-tight">
                  Contents
                </h5>
                <p className="text-[10px] text-slate-400">Drag or use arrows to reorder items</p>
              </div>

              <button
                onClick={(e) => handleAddChapter(product.id, e)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> New Content
              </button>
            </div>

            {/* List of Chapters / Parts */}
            {contentsCount === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">No content items added to this module yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contents.map((ch, idx) => {
                  const chKey = `${product.id}-${idx}`;
                  const isChapterDragging = draggedChapter?.ebookId === product.id && draggedChapter?.index === idx;
                  const isChapterOver = dragOverChapterKey === chKey && !isChapterDragging;

                  return (
                    <div
                      key={ch.id || idx}
                      draggable
                      onDragStart={(e) => handleChapterDragStart(e, product.id, idx)}
                      onDragOver={(e) => handleChapterDragOver(e, product.id, idx)}
                      onDragLeave={(e) => handleChapterDragLeave(e, product.id, idx)}
                      onDrop={(e) => handleChapterDrop(e, product.id, idx)}
                      onDragEnd={handleChapterDragEnd}
                      className={`bg-white p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-move select-none ${
                        isChapterOver
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md translate-y-[-1px]'
                          : isChapterDragging
                          ? 'opacity-35 border-blue-400 border-dashed scale-[0.99]'
                          : 'border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Grip + Reorder Arrows + Number + Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="flex flex-col items-center justify-center shrink-0 -space-y-1.5 py-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => handleMoveChapter(product.id, idx, -1, e)}
                            className="text-slate-300 hover:text-blue-600 disabled:opacity-0 p-0.5 rounded transition-colors"
                            title="Move content up"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <span
                            className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                            title="Drag to reorder"
                          >
                            <GripVertical size={14} />
                          </span>
                          <button
                            type="button"
                            disabled={idx === contents.length - 1}
                            onClick={(e) => handleMoveChapter(product.id, idx, 1, e)}
                            className="text-slate-300 hover:text-blue-600 disabled:opacity-0 p-0.5 rounded transition-colors"
                            title="Move content down"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200/80 shrink-0">
                          {ch.number || idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h6 className="font-bold text-xs text-slate-800 truncate">
                            {ch.title}
                          </h6>
                          {ch.gammaUrl && (
                            <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5 max-w-sm sm:max-w-md">
                              {ch.gammaUrl}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: External Link + Edit + Delete Icons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {ch.gammaUrl && (
                          <a
                            href={ch.gammaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Open in Gamma"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}

                        <button
                          onClick={(e) => handleEditChapter(product.id, ch, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Edit Content"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteChapter(product.id, ch?.id, idx, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Delete Content"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Hub
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Products - DailyGrace App
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage all products, modules and chapters
            </p>
          </div>

          <button
            onClick={handleOpenNewProduct}
            className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} /> New Product
          </button>
        </div>

        {/* Section 1: SUPPLEMENTS */}
        {suplementos.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              SUPPLEMENTS
            </h3>
            <div className="space-y-2.5">
              {suplementos.map((p, idx) => renderProductItem(p, idx, true))}
            </div>
          </div>
        )}

        {/* Section 2: MODULES */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            MODULES
          </h3>
          <div className="space-y-2.5">
            {modulos.map((p, idx) => renderProductItem(p, idx, false))}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <EbookModal
        isOpen={ebookModalOpen}
        onClose={() => setEbookModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingEbook}
      />

      {/* Chapter / Content Modal */}
      <ChapterModal
        isOpen={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        onSave={handleSaveChapter}
        initialData={editingChapter}
        defaultNumber={
          ((ebooks.find(b => b.id === activeParentEbookId)?.chapters?.length || 0) + 1)
        }
      />
    </div>
  );
}
