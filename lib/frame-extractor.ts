export type ExtractedFrame = {
  id: string;
  time: number;
  score: number;
  dataUrl: string;
};

type Sample = {
  time: number;
  pixels: Uint8ClampedArray;
  score: number;
};

const seek = (video: HTMLVideoElement, time: number) =>
  new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Không thể đọc frame video tại mốc đã chọn."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = Math.min(Math.max(time, 0), Math.max(video.duration - 0.03, 0));
  });

const difference = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
  let total = 0;
  for (let index = 0; index < a.length; index += 4) {
    const aLuma = a[index] * 0.299 + a[index + 1] * 0.587 + a[index + 2] * 0.114;
    const bLuma = b[index] * 0.299 + b[index + 1] * 0.587 + b[index + 2] * 0.114;
    total += Math.abs(aLuma - bLuma);
  }
  return total / (a.length / 4) / 255;
};

const renderFrame = (video: HTMLVideoElement, quality = 0.82) => {
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ Canvas 2D.");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
};

export async function extractSceneFrames(
  file: File,
  options: { maxFrames: number; sensitivity: number },
): Promise<ExtractedFrame[]> {
  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.src = sourceUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("Không thể mở video này.")), { once: true });
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("Video không có thời lượng hợp lệ.");

    const analysisCanvas = document.createElement("canvas");
    analysisCanvas.width = 96;
    analysisCanvas.height = 54;
    const context = analysisCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Trình duyệt không hỗ trợ Canvas 2D.");

    const sampleCount = Math.min(180, Math.max(18, Math.ceil(duration * 2)));
    const samples: Sample[] = [];
    let previous: Uint8ClampedArray | undefined;

    for (let index = 0; index < sampleCount; index += 1) {
      const time = (index / Math.max(sampleCount - 1, 1)) * Math.max(duration - 0.05, 0);
      await seek(video, time);
      context.drawImage(video, 0, 0, analysisCanvas.width, analysisCanvas.height);
      const pixels = context.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height).data;
      const score = previous ? difference(previous, pixels) : 1;
      samples.push({ time, pixels: new Uint8ClampedArray(pixels), score });
      previous = new Uint8ClampedArray(pixels);
    }

    const minGap = Math.max(0.75, duration / (options.maxFrames * 2.4));
    const threshold = 0.055 + (1 - options.sensitivity) * 0.18;
    const candidates = samples
      .filter((sample, index) => index === 0 || sample.score >= threshold)
      .sort((left, right) => right.score - left.score);

    const selected: Sample[] = [samples[0]];
    for (const candidate of candidates) {
      if (selected.length >= options.maxFrames) break;
      if (selected.every((item) => Math.abs(item.time - candidate.time) >= minGap)) selected.push(candidate);
    }

    if (selected.length < Math.min(options.maxFrames, 4)) {
      for (let index = 1; index < options.maxFrames; index += 1) {
        const target = (index / options.maxFrames) * duration;
        const nearest = samples.reduce((best, item) =>
          Math.abs(item.time - target) < Math.abs(best.time - target) ? item : best,
        );
        if (selected.every((item) => Math.abs(item.time - nearest.time) >= minGap / 2)) selected.push(nearest);
      }
    }

    selected.sort((left, right) => left.time - right.time);
    const frames: ExtractedFrame[] = [];
    for (const sample of selected.slice(0, options.maxFrames)) {
      await seek(video, sample.time);
      frames.push({
        id: `frame-${sample.time.toFixed(3)}`,
        time: sample.time,
        score: sample.score,
        dataUrl: renderFrame(video),
      });
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(sourceUrl);
  }
}

export function downloadFrame(frame: ExtractedFrame) {
  const anchor = document.createElement("a");
  anchor.href = frame.dataUrl;
  anchor.download = `tessa-frame-${frame.time.toFixed(2)}s.jpg`;
  anchor.click();
}
