"use client";

import { useEffect, useRef, useState } from "react";

type ShapeKind = "circle" | "rect" | "poly";

type Point = {
  x: number;
  y: number;
};

type Shape = {
  id: string;
  kind: ShapeKind;
  cx: number;
  cy: number;
  r?: number;
  w?: number;
  h?: number;
  points?: Point[];
};

const DAILY_SHAPES = 28;
const STORAGE_PREFIX = "color-today::v1";
const DEFAULT_COLOR = "#f0643a";
const PALETTE = [
  "#f0643a",
  "#f6b83f",
  "#4bb58f",
  "#2a79ff",
  "#7232d5",
  "#ff6b9a",
  "#1d1d1b",
  "#ffffff"
];

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashStringToSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function storageKey(dateKey: string) {
  return `${STORAGE_PREFIX}:${dateKey}`;
}

function generateShapes(seed: number, count: number) {
  const rand = mulberry32(seed);
  const shapes: Shape[] = [];
  const margin = 0.08;

  for (let i = 0; i < count; i += 1) {
    const kindRoll = rand();
    const cx = margin + (1 - margin * 2) * rand();
    const cy = margin + (1 - margin * 2) * rand();

    if (kindRoll < 0.4) {
      const r = 0.06 + rand() * 0.12;
      shapes.push({ id: `shape-${i}`, kind: "circle", cx, cy, r });
    } else if (kindRoll < 0.7) {
      const w = 0.12 + rand() * 0.18;
      const h = 0.12 + rand() * 0.18;
      shapes.push({ id: `shape-${i}`, kind: "rect", cx, cy, w, h });
    } else {
      const points: Point[] = [];
      const sides = 5 + Math.floor(rand() * 4);
      const radius = 0.08 + rand() * 0.12;
      const start = rand() * Math.PI * 2;
      for (let p = 0; p < sides; p += 1) {
        const angle = start + (Math.PI * 2 * p) / sides;
        const wobble = 0.65 + rand() * 0.5;
        points.push({
          x: cx + Math.cos(angle) * radius * wobble,
          y: cy + Math.sin(angle) * radius * wobble
        });
      }
      shapes.push({ id: `shape-${i}`, kind: "poly", cx, cy, points });
    }
  }

  return shapes;
}

function traceShape(ctx: CanvasRenderingContext2D, shape: Shape, size: number) {
  if (shape.kind === "circle" && shape.r) {
    ctx.beginPath();
    ctx.arc(shape.cx * size, shape.cy * size, shape.r * size, 0, Math.PI * 2);
    return;
  }

  if (shape.kind === "rect" && shape.w && shape.h) {
    ctx.beginPath();
    ctx.rect(
      (shape.cx - shape.w / 2) * size,
      (shape.cy - shape.h / 2) * size,
      shape.w * size,
      shape.h * size
    );
    return;
  }

  if (shape.kind === "poly" && shape.points) {
    ctx.beginPath();
    shape.points.forEach((point, index) => {
      const x = point.x * size;
      const y = point.y * size;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
  }
}

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function hitTest(shapes: Shape[], point: Point) {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i];
    if (shape.kind === "circle" && shape.r) {
      const dx = point.x - shape.cx;
      const dy = point.y - shape.cy;
      if (dx * dx + dy * dy <= shape.r * shape.r) {
        return shape;
      }
    }

    if (shape.kind === "rect" && shape.w && shape.h) {
      const left = shape.cx - shape.w / 2;
      const right = shape.cx + shape.w / 2;
      const top = shape.cy - shape.h / 2;
      const bottom = shape.cy + shape.h / 2;
      if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
        return shape;
      }
    }

    if (shape.kind === "poly" && shape.points) {
      if (pointInPolygon(point, shape.points)) {
        return shape;
      }
    }
  }

  return null;
}

export default function ColorToday() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [canvasSize, setCanvasSize] = useState(640);
  const [shareUrl, setShareUrl] = useState("");
  const paintingRef = useRef(false);
  const lastHitRef = useRef<string | null>(null);

  useEffect(() => {
    setDateKey(getLocalDateKey());
    setShareUrl(window.location.href);
    const interval = setInterval(() => {
      setDateKey((prev) => {
        const next = getLocalDateKey();
        return prev === next ? prev : next;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dateKey) {
      return;
    }
    const seed = hashStringToSeed(dateKey);
    const nextShapes = generateShapes(seed, DAILY_SHAPES);
    setShapes(nextShapes);

    try {
      const stored = localStorage.getItem(storageKey(dateKey));
      if (stored) {
        setFills(JSON.parse(stored));
      } else {
        setFills({});
      }
    } catch (error) {
      setFills({});
    }
  }, [dateKey]);

  useEffect(() => {
    if (!dateKey) {
      return;
    }
    localStorage.setItem(storageKey(dateKey), JSON.stringify(fills));
  }, [fills, dateKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const width = entry.contentRect.width;
        setCanvasSize(Math.min(width, 900));
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    gradient.addColorStop(0, "#fff6e8");
    gradient.addColorStop(1, "#f1f7ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1d1d1b";
    ctx.lineJoin = "round";

    shapes.forEach((shape) => {
      traceShape(ctx, shape, canvasSize);
      ctx.fillStyle = fills[shape.id] ?? "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(29, 29, 27, 0.7)";
    ctx.font = "600 12px Work Sans, sans-serif";
    ctx.fillText(dateKey ?? "", 12, canvasSize - 12);
  }, [canvasSize, shapes, fills, dateKey]);

  const handleColorChange = (value: string) => {
    setCurrentColor(value);
  };

  const paintAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const hit = hitTest(shapes, { x, y });
    if (hit && lastHitRef.current !== hit.id) {
      lastHitRef.current = hit.id;
      setFills((prev) => ({ ...prev, [hit.id]: currentColor }));
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    paintingRef.current = true;
    lastHitRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    paintAt(event);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current) {
      return;
    }
    paintAt(event);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    paintingRef.current = false;
    lastHitRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !dateKey) {
      return;
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `color-today-${dateKey}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !dateKey) {
      return;
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      return;
    }
    const file = new File([blob], `color-today-${dateKey}.png`, {
      type: "image/png"
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "color today",
        text: "Here is my color today canvas",
        files: [file]
      });
      return;
    }

    await handleDownload();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
  };

  const handleReset = () => {
    setFills({});
  };

  const shareText = encodeURIComponent(
    "I colored today\'s abstract canvas on color today"
  );
  const shareLink = encodeURIComponent(shareUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareLink}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`;

  return (
    <>
      <section className="canvas-panel">
        <div className="canvas-shell" ref={containerRef}>
          <canvas
            ref={canvasRef}
            aria-label="Daily abstract art canvas"
            role="img"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
        <div className="note">
          Tap a shape to fill it. Your progress stays on this device.
        </div>
      </section>
      <aside className="controls">
        <h2>Pick a color</h2>
        <p>Use the native color picker or quick swatches.</p>
        <div className="color-row">
          <input
            aria-label="Color picker"
            className="color-input"
            type="color"
            value={currentColor}
            onChange={(event) => handleColorChange(event.target.value)}
          />
          <span>{currentColor.toUpperCase()}</span>
        </div>
        <div className="palette" aria-label="Color swatches">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              style={{ background: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Use ${color}`}
            />
          ))}
        </div>
        <div>
          <h2>Save or share</h2>
          <p>
            Download your canvas or share it directly on mobile. For Instagram
            Stories, use the Share Image button.
          </p>
        </div>
        <div className="actions">
          <button type="button" onClick={handleDownload}>
            Download PNG
          </button>
          <button type="button" className="secondary" onClick={handleShareImage}>
            Share Image
          </button>
        </div>
        <div className="share-grid">
          <a className="action-link" href={twitterUrl} target="_blank" rel="noreferrer">
            Share on X
          </a>
          <a
            className="action-link"
            href={linkedInUrl}
            target="_blank"
            rel="noreferrer"
          >
            Share on LinkedIn
          </a>
          <a
            className="action-link"
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
          >
            Share on Facebook
          </a>
          <button type="button" className="secondary" onClick={handleCopyLink}>
            Copy link
          </button>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleReset}>
            Reset today
          </button>
        </div>
        <p className="note">
          Sharing links post your page URL. The image button shares the PNG to
          apps like Instagram Stories when supported.
        </p>
      </aside>
    </>
  );
}
