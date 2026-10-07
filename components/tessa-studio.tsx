"use client";

import {
  Aperture,
  Box,
  Check,
  ChevronRight,
  Clapperboard,
  Download,
  Film,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Play,
  Plus,
  ScanSearch,
  Sparkles,
  Upload,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { downloadFrame, extractSceneFrames, type ExtractedFrame } from "@/lib/frame-extractor";
import {
  demoPlan,
  type AssetKind,
  type ProductionAsset,
  type ProductionPlan,
} from "@/lib/production-schema";

const sampleScript = `Late night inside a dark government analysis office. A lone analyst sits beneath a dome security camera. A 3x3 CCTV grid shows empty corridors and his own desk from behind. He raises his right hand to test the feed. On screen, the same hand rises exactly one second before he moves. The on-screen analyst then turns and looks directly into the ceiling camera. The real analyst freezes and slowly looks up.`;

const kindMeta: Record<AssetKind, { label: string; icon: typeof UserRound }> = {
  character: { label: "Nhân vật", icon: UserRound },
  location: { label: "Bối cảnh", icon: MapPin },
  prop: { label: "Đạo cụ", icon: Box },
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
};

function AssetIcon({ kind }: { kind: AssetKind }) {
  const Icon = kindMeta[kind].icon;
  return <Icon size={16} strokeWidth={1.8} />;
}

export function TessaStudio() {
  const [script, setScript] = useState(sampleScript);
  const [plan, setPlan] = useState<ProductionPlan>(demoPlan);
  const [activeKind, setActiveKind] = useState<AssetKind>("character");
  const [selectedAssetId, setSelectedAssetId] = useState(demoPlan.assets[0].id);
  const [provider, setProvider] = useState<"openai" | "bytedance">("openai");
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.62);
  const [maxFrames, setMaxFrames] = useState(8);
  const videoInput = useRef<HTMLInputElement>(null);
  const scriptInput = useRef<HTMLInputElement>(null);

  const filteredAssets = useMemo(
    () => plan.assets.filter((asset) => asset.kind === activeKind),
    [activeKind, plan.assets],
  );
  const selectedAsset = plan.assets.find((asset) => asset.id === selectedAssetId) || filteredAssets[0];

  const analyze = async () => {
    setAnalyzing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/analyze-script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const payload = (await response.json()) as { plan?: ProductionPlan; error?: string };
      if (!response.ok || !payload.plan) throw new Error(payload.error || "Không thể bóc tách kịch bản.");
      setPlan(payload.plan);
      setSelectedAssetId(payload.plan.assets[0]?.id || "");
      setActiveKind(payload.plan.assets[0]?.kind || "character");
      setMessage(`Đã tách ${payload.plan.assets.length} asset và ${payload.plan.shots.length} shot.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể bóc tách kịch bản.");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadScriptFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("File script vượt 2 MB. Hãy chia nhỏ theo chương.");
      return;
    }
    setScript(await file.text());
    setMessage(`Đã nạp ${file.name}.`);
  };

  const updateAsset = (id: string, patch: Partial<ProductionAsset>) => {
    setPlan((current) => ({
      ...current,
      assets: current.assets.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)),
    }));
  };

  const generateAsset = async (asset: ProductionAsset) => {
    setGeneratingId(asset.id);
    setMessage(null);
    try {
      const referenceImages = provider === "bytedance"
        ? frames.filter((frame) => selectedFrames.includes(frame.id)).map((frame) => frame.dataUrl)
        : [];
      const response = await fetch("/api/generate-asset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: asset.visualPrompt, provider, referenceImages }),
      });
      const payload = (await response.json()) as { imageUrl?: string; error?: string };
      if (!response.ok || !payload.imageUrl) throw new Error(payload.error || "Không thể tạo ảnh.");
      updateAsset(asset.id, { imageUrl: payload.imageUrl });
      setMessage(`Đã tạo reference cho ${asset.name} bằng ${provider === "openai" ? "GPT Image" : "Seedream"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo ảnh.");
    } finally {
      setGeneratingId(null);
    }
  };

  const extractFrames = async (file?: File) => {
    if (!file) return;
    setExtracting(true);
    setMessage(null);
    try {
      const result = await extractSceneFrames(file, { maxFrames, sensitivity });
      setFrames(result);
      setSelectedFrames(result.slice(0, 3).map((frame) => frame.id));
      setMessage(`Đã tìm ${result.length} keyframe ngay trong trình duyệt — video không bị upload.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tách frame.");
    } finally {
      setExtracting(false);
      if (videoInput.current) videoInput.current.value = "";
    }
  };

  const selectKind = (kind: AssetKind) => {
    setActiveKind(kind);
    const first = plan.assets.find((asset) => asset.kind === kind);
    if (first) setSelectedAssetId(first.id);
  };

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark"><Aperture size={19} /></span>
          <div><strong>Tessa AI</strong><span>Production Lab</span></div>
        </div>
        <div className="project-title">
          <span className="status-dot" />
          <div><strong>{plan.title}</strong><span>{plan.genre}</span></div>
        </div>
        <div className="top-actions">
          <span className="save-state"><Check size={14} /> Local draft</span>
          <button className="button button-dark"><Play size={15} fill="currentColor" /> Render plan</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="left-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">01 · Input</span><h2>Kịch bản nguồn</h2></div>
            <button className="icon-button" onClick={() => scriptInput.current?.click()} title="Nạp file script"><Upload size={17} /></button>
            <input ref={scriptInput} hidden type="file" accept=".txt,.md,.srt,.vtt" onChange={(event) => loadScriptFile(event.target.files?.[0])} />
          </div>
          <textarea className="script-editor" value={script} onChange={(event) => setScript(event.target.value)} spellCheck={false} />
          <div className="editor-stats"><span>{script.length.toLocaleString("vi-VN")} ký tự</span><span>Claude</span></div>
          <button className="button button-accent analyze-button" onClick={analyze} disabled={analyzing}>
            {analyzing ? <LoaderCircle className="spin" size={17} /> : <ScanSearch size={17} />}
            {analyzing ? "Đang bóc tách…" : "Bóc tách kịch bản"}
          </button>

          <div className="frame-tool">
            <div className="panel-heading compact">
              <div><span className="eyebrow">02 · Video</span><h2>Auto keyframe</h2></div>
              <Film size={18} />
            </div>
            <p>Tìm điểm đổi cảnh bằng pixel difference. Chạy local, không tốn băng thông API.</p>
            <div className="control-row">
              <label>Độ nhạy <strong>{Math.round(sensitivity * 100)}%</strong></label>
              <input type="range" min="0.25" max="0.9" step="0.01" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} />
            </div>
            <div className="control-row inline">
              <label>Frame tối đa</label>
              <select value={maxFrames} onChange={(event) => setMaxFrames(Number(event.target.value))}>
                {[4, 6, 8, 12, 16].map((value) => <option value={value} key={value}>{value}</option>)}
              </select>
            </div>
            <button className="button button-outline wide" onClick={() => videoInput.current?.click()} disabled={extracting}>
              {extracting ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
              {extracting ? "Đang quét video…" : "Chọn video để tách frame"}
            </button>
            <input ref={videoInput} hidden type="file" accept="video/*" onChange={(event) => extractFrames(event.target.files?.[0])} />
          </div>
        </aside>

        <section className="center-panel">
          <div className="center-head">
            <div><span className="eyebrow">03 · Production bible</span><h1>Asset registry</h1><p>{plan.logline}</p></div>
            <div className="provider-switch" aria-label="Image provider">
              <button className={provider === "openai" ? "active" : ""} onClick={() => setProvider("openai")}>OpenAI</button>
              <button className={provider === "bytedance" ? "active" : ""} onClick={() => setProvider("bytedance")}>ByteDance</button>
            </div>
          </div>

          {message && <div className="notice"><Sparkles size={15} /><span>{message}</span><button onClick={() => setMessage(null)}><X size={14} /></button></div>}

          <nav className="asset-tabs">
            {(Object.keys(kindMeta) as AssetKind[]).map((kind) => {
              const count = plan.assets.filter((asset) => asset.kind === kind).length;
              return <button key={kind} className={activeKind === kind ? "active" : ""} onClick={() => selectKind(kind)}><AssetIcon kind={kind} />{kindMeta[kind].label}<span>{count}</span></button>;
            })}
          </nav>

          <div className="asset-grid">
            {filteredAssets.map((asset) => (
              <button key={asset.id} className={`asset-card ${asset.id === selectedAsset?.id ? "selected" : ""}`} onClick={() => setSelectedAssetId(asset.id)}>
                <div className="asset-preview">
                  {asset.imageUrl ? (
                    <>
                      {/* Provider URLs and data URLs are not compatible with the Next image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.imageUrl} alt={asset.name} />
                    </>
                  ) : <><AssetIcon kind={asset.kind} /><span>Reference pending</span></>}
                </div>
                <div className="asset-card-copy"><span>{asset.id}</span><strong>{asset.name}</strong><p>{asset.summary}</p></div>
                <ChevronRight size={16} className="card-arrow" />
              </button>
            ))}
            <button className="asset-card add-card"><Plus size={20} /><span>Thêm asset thủ công</span></button>
          </div>

          {selectedAsset && (
            <section className="asset-inspector">
              <div className="inspector-head">
                <div className="asset-kind-pill"><AssetIcon kind={selectedAsset.kind} />{kindMeta[selectedAsset.kind].label}</div>
                <button className="button button-accent" onClick={() => generateAsset(selectedAsset)} disabled={generatingId === selectedAsset.id}>
                  {generatingId === selectedAsset.id ? <LoaderCircle className="spin" size={16} /> : <WandSparkles size={16} />}
                  {generatingId === selectedAsset.id ? "Đang tạo…" : `Tạo ảnh bằng ${provider === "openai" ? "GPT Image" : "Seedream"}`}
                </button>
              </div>
              <div className="form-grid">
                <label>Tên asset<input value={selectedAsset.name} onChange={(event) => updateAsset(selectedAsset.id, { name: event.target.value })} /></label>
                <label>Stable ID<input value={selectedAsset.id} readOnly /></label>
                <label className="full">Visual prompt<textarea value={selectedAsset.visualPrompt} onChange={(event) => updateAsset(selectedAsset.id, { visualPrompt: event.target.value })} /></label>
                <label className="full">Continuity lock<textarea value={selectedAsset.continuityNotes} onChange={(event) => updateAsset(selectedAsset.id, { continuityNotes: event.target.value })} /></label>
              </div>
            </section>
          )}

          <section className="frame-results">
            <div className="section-title"><div><span className="eyebrow">Extracted locally</span><h2>Video keyframes</h2></div><span>{frames.length} frames</span></div>
            {frames.length === 0 ? (
              <div className="empty-state"><Clapperboard size={25} /><strong>Chưa có video</strong><span>Chọn video ở cột trái để tự tìm các điểm đổi cảnh.</span></div>
            ) : (
              <div className="frame-strip">
                {frames.map((frame) => {
                  const checked = selectedFrames.includes(frame.id);
                  return <article className={`frame-card ${checked ? "selected" : ""}`} key={frame.id}>
                    <button className="frame-select" onClick={() => setSelectedFrames((current) => checked ? current.filter((id) => id !== frame.id) : [...current, frame.id])}>
                      {/* Frame data URLs are generated locally and cannot use the Next image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={frame.dataUrl} alt={`Keyframe ${formatTime(frame.time)}`} />
                      <span className="checkmark">{checked && <Check size={13} />}</span>
                    </button>
                    <div><strong>{formatTime(frame.time)}</strong><span>Δ {Math.round(frame.score * 100)}%</span><button onClick={() => downloadFrame(frame)} title="Tải frame"><Download size={14} /></button></div>
                  </article>;
                })}
              </div>
            )}
            {provider === "bytedance" && selectedFrames.length > 0 && <p className="helper-text">{selectedFrames.length} frame đã chọn sẽ được gửi làm ảnh tham chiếu Seedream. OpenAI generation hiện chạy text-to-image độc lập.</p>}
          </section>
        </section>

        <aside className="right-panel">
          <div className="panel-heading"><div><span className="eyebrow">04 · Timeline</span><h2>Shot plan</h2></div><span className="shot-count">{plan.shots.length}</span></div>
          <div className="timeline-list">
            {plan.shots.map((shot, index) => (
              <article className="shot-card" key={shot.id}>
                <div className="shot-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="shot-copy">
                  <div><strong>{shot.title}</strong><span>{shot.progressStart}–{shot.progressEnd}%</span></div>
                  <p>{shot.action}</p>
                  <dl><div><dt>CAM</dt><dd>{shot.camera}</dd></div><div><dt>LIGHT</dt><dd>{shot.lighting}</dd></div></dl>
                  <div className="asset-links">
                    {[shot.locationAssetId, ...shot.characterAssetIds, ...shot.propAssetIds].filter(Boolean).map((id) => <span key={id}>@{plan.assets.find((asset) => asset.id === id)?.name || id}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="style-note"><ImageIcon size={17} /><div><strong>Visual direction</strong><p>{plan.visualStyle}</p></div></div>
        </aside>
      </section>
    </main>
  );
}
