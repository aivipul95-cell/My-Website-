/** Read image Files as base64 data URLs, downscaling very large images to keep IndexedDB lean. */
export function fileToDataUrl(file, maxDim = 2000) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const src = reader.result;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        if (scale === 1) return resolve(src);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export const imageFiles = (list) => Array.from(list || []).filter((f) => f.type.startsWith('image/'));
