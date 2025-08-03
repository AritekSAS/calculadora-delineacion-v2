export const useShareImage = (resultCardRef) => {
  const handleShare = async () => {
    if (!resultCardRef.current || typeof window.html2canvas === 'undefined') {
      alert('Error: La librería para generar la imagen no está lista.');
      return;
    }
    const canvas = await window.html2canvas(resultCardRef.current, {
      useCORS: true,
      backgroundColor: '#111827',
      onclone: (doc) => {
        const btn = doc.getElementById('share-button-clone');
        if (btn) btn.style.display = 'none';
      },
    });
    const dataUrl = canvas.toDataURL('image/png');
    const downloadImage = () => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'liquidacion_delineacion.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    try {
      if (!navigator.share) {
        throw new Error('Web Share API no es compatible, se descargará la imagen.');
      }
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'liquidacion_delineacion.png', { type: 'image/png' });
      await navigator.share({
        title: 'Liquidación Impuesto de Delineación',
        text: 'Adjunto la estimación del impuesto de delineación.',
        files: [file],
      });
    } catch (error) {
      console.warn('Fallo el API de compartir, usando descarga como fallback:', error.message);
      downloadImage();
    }
  };
  return handleShare;
};