"use client";

import { useState } from "react";
import { X, Layers, Compass, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import { BANTEN_ANATOMY_GUIDES, type BantenAnatomyGuide } from "../../lib/banten-anatomy";

interface BantenAnatomyModalProps {
  guideId: "canang_sari" | "pejati";
  isOpen: boolean;
  onClose: () => void;
}

export default function BantenAnatomyModal({ guideId, isOpen, onClose }: BantenAnatomyModalProps) {
  const [activeTab, setActiveTab] = useState<"canang_sari" | "pejati">(guideId);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentGuide: BantenAnatomyGuide = BANTEN_ANATOMY_GUIDES[activeTab] || BANTEN_ANATOMY_GUIDES.canang_sari;
  const activeLayer = currentGuide.layers[selectedLayerIndex] || currentGuide.layers[0];

  return (
    <div
      className="anatomy-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anatomy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="anatomy-modal-card">
        {/* Modal Header */}
        <div className="anatomy-modal-header">
          <div className="anatomy-modal-title-group">
            <span className="anatomy-header-badge">
              <BookOpen size={16} aria-hidden="true" />
              <span>Panduan Metanding Generasi Muda</span>
            </span>
            <h3 id="anatomy-modal-title">{currentGuide.name}</h3>
            <p className="anatomy-modal-subtitle">{currentGuide.subtitle}</p>
          </div>
          <button
            type="button"
            className="anatomy-close-btn"
            onClick={onClose}
            aria-label="Tutup panduan anatomi banten"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Tab Switcher between Canang Sari & Pejati */}
        <div className="anatomy-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "canang_sari"}
            className={`anatomy-tab-btn ${activeTab === "canang_sari" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("canang_sari");
              setSelectedLayerIndex(0);
            }}
          >
            🌺 Anatomi Canang Sari
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pejati"}
            className={`anatomy-tab-btn ${activeTab === "pejati" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("pejati");
              setSelectedLayerIndex(0);
            }}
          >
            🪔 Anatomi Banten Pejati
          </button>
        </div>

        {/* Modal Body */}
        <div className="anatomy-modal-body">
          {/* Philosophical Principle Box */}
          <div className="anatomy-summary-box">
            <p className="anatomy-summary-text">{currentGuide.summary}</p>
            <div className="anatomy-principle-quote">
              <Sparkles size={16} className="quote-sparkle" aria-hidden="true" />
              <em>&ldquo;{currentGuide.mantraOrPrinciple}&rdquo;</em>
            </div>
          </div>

          {/* Interactive Layer Explorer */}
          <div className="anatomy-layout-grid">
            {/* Left: Layer Selector (Bottom-to-Top stacked visual) */}
            <div className="anatomy-layers-nav">
              <div className="layers-nav-title">
                <Layers size={16} aria-hidden="true" />
                <span>Susunan Layer (Bawah ke Atas)</span>
              </div>
              <div className="layers-stack-list">
                {currentGuide.layers.map((layer, idx) => {
                  const isSelected = idx === selectedLayerIndex;
                  return (
                    <button
                      key={layer.layerNumber}
                      type="button"
                      className={`layer-nav-item ${isSelected ? "is-active" : ""}`}
                      onClick={() => setSelectedLayerIndex(idx)}
                    >
                      <span className="layer-step-num">L{layer.layerNumber}</span>
                      <div className="layer-nav-meta">
                        <strong className="layer-nav-name">{layer.name}</strong>
                        <span className="layer-nav-term">{layer.balineseTerm}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Layer Exploded View */}
            <div className="anatomy-layer-detail-card">
              <div className="detail-layer-header">
                <span className="detail-badge">Layer ke-{activeLayer.layerNumber} dari {currentGuide.layers.length}</span>
                <h4>{activeLayer.name}</h4>
                <div className="detail-balinese-pill">{activeLayer.balineseTerm}</div>
              </div>

              <div className="detail-section">
                <strong className="detail-label">Makna Filosofis & Simbolis:</strong>
                <p className="detail-text">{activeLayer.symbolism}</p>
              </div>

              <div className="detail-section">
                <strong className="detail-label">Komponen Bahan:</strong>
                <ul className="detail-ingredients-list">
                  {activeLayer.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-tips-box">
                <strong>💡 Tips Metanding untuk Pemula:</strong>
                <p>{activeLayer.tipsForYouth}</p>
              </div>
            </div>
          </div>

          {/* Special Section: 5 Directions of Flowers (Panca Dewata) for Canang */}
          {currentGuide.rulesOfDirection && (
            <div className="anatomy-direction-section">
              <div className="direction-heading">
                <Compass size={18} aria-hidden="true" />
                <strong>Aturan Menaruh Bunga Menurut Arah Mata Angin (Panca Dewata)</strong>
              </div>
              <div className="direction-grid">
                {currentGuide.rulesOfDirection.map((dir, i) => (
                  <div key={i} className="direction-item-card">
                    <div className="direction-top">
                      <span className="direction-badge">{dir.direction}</span>
                      <strong>{dir.deity}</strong>
                    </div>
                    <div className="direction-flower">{dir.flowerColor}</div>
                    <p className="direction-meaning">{dir.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes to Avoid */}
          <div className="anatomy-mistakes-box">
            <div className="mistakes-title">
              <AlertTriangle size={18} aria-hidden="true" />
              <strong>Hal yang Sering Keliru / Perlu Dihindari</strong>
            </div>
            <ul>
              {currentGuide.commonMistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="anatomy-modal-footer">
          <p className="modal-footer-dresta">
            *Dresta & tetandingan dapat bervariasi menurut desa mawacara masing-masing banjar.
          </p>
          <button type="button" className="button button-primary" onClick={onClose}>
            Mengerti & Kembali ke Daftar
          </button>
        </div>
      </div>
    </div>
  );
}

