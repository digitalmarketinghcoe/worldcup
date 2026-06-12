type ShareCardData = {
  name: string;
  firstPlace: string;
  goldenBall: string;
  finalScore: string;
};

/**
 * Paints the 1080×1350 shareable prediction card onto a canvas.
 * Pure canvas 2D so it works offline and exports cleanly to PNG.
 */
export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Pitch-dark gradient backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#071124");
  bg.addColorStop(0.55, "#020617");
  bg.addColorStop(1, "#0a0214");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stadium glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.22, 60, W / 2, H * 0.22, W * 0.75);
  glow.addColorStop(0, "rgba(255,214,10,0.22)");
  glow.addColorStop(1, "rgba(255,214,10,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Crimson floor wash
  const floor = ctx.createRadialGradient(W / 2, H * 1.05, 80, W / 2, H * 1.05, W * 0.9);
  floor.addColorStop(0, "rgba(217,4,41,0.3)");
  floor.addColorStop(1, "rgba(217,4,41,0)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, W, H);

  // Frame
  ctx.strokeStyle = "rgba(255,214,10,0.35)";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.textAlign = "center";

  // Header
  ctx.fillStyle = "rgba(226,232,240,0.6)";
  ctx.font = "600 34px Inter, sans-serif";
  ctx.fillText("HCOE WORLD CUP FAN ZONE 2026", W / 2, 170);

  // Trophy mark
  ctx.font = "160px serif";
  ctx.fillText("🏆", W / 2, 400);

  // Main claim — 1st place
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "500 44px Inter, sans-serif";
  ctx.fillText("I PREDICTED", W / 2, 520);

  ctx.fillStyle = "#ffd60a";
  ctx.font = "700 110px 'Bebas Neue', Impact, sans-serif";
  ctx.fillText(data.firstPlace.toUpperCase(), W / 2, 645);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "500 44px Inter, sans-serif";
  ctx.fillText("TO WIN THE FIFA WORLD CUP", W / 2, 720);

  // Divider
  ctx.strokeStyle = "rgba(226,232,240,0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, 790);
  ctx.lineTo(W * 0.8, 790);
  ctx.stroke();

  // Golden Ball
  ctx.fillStyle = "rgba(226,232,240,0.55)";
  ctx.font = "400 32px Inter, sans-serif";
  ctx.fillText("GOLDEN BALL", W / 2, 860);
  ctx.fillStyle = "#ffd60a";
  ctx.font = "600 52px 'Space Grotesk', Inter, sans-serif";
  ctx.fillText(data.goldenBall, W / 2, 930);

  // Final score
  ctx.fillStyle = "rgba(226,232,240,0.55)";
  ctx.font = "400 32px Inter, sans-serif";
  ctx.fillText("FINAL SCORE PREDICTION", W / 2, 1010);
  ctx.fillStyle = "#00d26a";
  ctx.font = "600 46px 'Space Grotesk', Inter, sans-serif";
  ctx.fillText(data.finalScore, W / 2, 1075);

  // Predictor
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 52px Inter, sans-serif";
  ctx.fillText(data.name, W / 2, 1190);

  // Footer brand
  ctx.fillStyle = "#ffd60a";
  ctx.font = "700 40px 'Bebas Neue', Impact, sans-serif";
  ctx.fillText("POWERED BY HCOE", W / 2, 1270);
  ctx.fillStyle = "rgba(226,232,240,0.4)";
  ctx.font = "400 28px Inter, sans-serif";
  ctx.fillText("Himalaya College of Engineering", W / 2, 1315);
}
