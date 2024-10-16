import React, { useRef, useEffect, useState } from 'react';
import templateImageSrc from './TEMPLATE.png';

const CanvaTemplate = () => {
  const canvasRef = useRef(null);
  const [templateImage, setTemplateImage] = useState(null);

  // Template image coordinates
  const templateCoords = {
    x1: 19, y1: 63,
    x2: 392, y2: 434
  };

  // Calculate dimensions of the image area
  const targetWidth = templateCoords.x2 - templateCoords.x1;
  const targetHeight = templateCoords.y2 - templateCoords.y1;

  // Load the template image
  useEffect(() => {
    const loadTemplateImage = () => {
      const img = new Image();
      img.src = templateImageSrc; // Make sure this path is correct
      img.onload = () => {
        setTemplateImage(img);
      };
      img.onerror = () => {
        console.error("Error loading template image.");
      };
    };

    loadTemplateImage();
  }, []);

  // Draw the template image on the canvas
  useEffect(() => {
    if (templateImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions based on template
      canvas.width = templateImage.width;
      canvas.height = templateImage.height;

      // Draw the template
      ctx.drawImage(templateImage, 0, 0);
    }
  }, [templateImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file && templateImage) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64String = e.target.result;
        localStorage.setItem('uploadedImage', base64String);

        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // Redraw the template
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(templateImage, 0, 0);

          // Calculate aspect ratios
          const imageRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;

          let sourceX, sourceY, sourceWidth, sourceHeight;

          if (imageRatio > targetRatio) {
            // Image is wider than the target
            sourceHeight = img.height;
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
            sourceY = 0;
          } else {
            // Image is taller than the target
            sourceWidth = img.width;
            sourceHeight = img.width / targetRatio;
            sourceX = 0;
            sourceY = (img.height - sourceHeight) / 2;
          }

          // Draw the uploaded image in the specified area
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
            templateCoords.x1, templateCoords.y1, targetWidth, targetHeight  // Destination rectangle
          );
        };
        img.src = base64String;
      };

      reader.readAsDataURL(file);
    } else {
      console.error("No file selected or template not loaded.");
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
      <br />
      <input type="file" onChange={handleImageUpload} accept="image/*" />
    </div>
  );
};

export default CanvaTemplate;
