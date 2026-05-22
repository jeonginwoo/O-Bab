/**
 * Merges two images side-by-side with a dashed line in the middle,
 * specifically for the Donto menu view.
 */
export async function mergeDontoImages(url1: string, url2: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img1 = new Image();
    const img2 = new Image();
    
    // We don't necessarily need crossOrigin if we're using a proxy on the same domain,
    // but it doesn't hurt.
    img1.crossOrigin = "anonymous";
    img2.crossOrigin = "anonymous";
    
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Could not get canvas context");

        // Set canvas size (5:4 aspect ratio)
        // High enough resolution for clear text
        const width = 2000;
        const height = 1600;
        canvas.width = width;
        canvas.height = height;

        const halfWidth = width / 2;
        const drawWidth = halfWidth * 1.6; // 160% scale
        const offset = halfWidth * -0.3;   // -30% margin-left

        // Function to draw a scaled and centered image in a half-box
        const drawHalf = (img: HTMLImageElement, startX: number) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(startX, 0, halfWidth, height);
          ctx.clip();

          const imgRatio = img.width / img.height;
          const targetRatio = drawWidth / height;
          let sw, sh, sx, sy;

          if (imgRatio > targetRatio) {
            sh = img.height;
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            sw = img.width;
            sh = img.width / targetRatio;
            sx = 0;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, startX + offset, 0, drawWidth, height);
          ctx.restore();
        };

        // Fill background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Draw images
        drawHalf(img1, 0);
        drawHalf(img2, halfWidth);

        // Draw dashed line
        ctx.beginPath();
        ctx.setLineDash([20, 20]);
        ctx.moveTo(halfWidth, 0);
        ctx.lineTo(halfWidth, height);
        ctx.strokeStyle = "#8892B0";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw solid background for the dash area to match DontoMenuView
        // Actually DontoMenuView has a solid color behind the dash.
        // Let's keep it simple first.

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      }
    };

    const onError = (e: any) => {
      reject("Failed to load images for merging");
    };

    img1.onload = onLoad;
    img2.onload = onLoad;
    img1.onerror = onError;
    img2.onerror = onError;
    
    img1.src = url1;
    img2.src = url2;
  });
}
