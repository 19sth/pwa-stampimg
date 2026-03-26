import React, { useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DownloadIcon from '@mui/icons-material/Download';

interface StampData {
  datetime: string;
  lat: number | null;
  lon: number | null;
}

function drawStamp(
  img: HTMLImageElement,
  stamp: StampData
): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  const lines: string[] = [stamp.datetime];
  if (stamp.lat !== null && stamp.lon !== null) {
    lines.push(`${stamp.lat.toFixed(6)}, ${stamp.lon.toFixed(6)}`);
  } else {
    lines.push('Location unavailable');
  }

  const baseFontSize = Math.max(canvas.width, canvas.height) * 0.025;
  const padding = baseFontSize * 0.8;
  const lineHeight = baseFontSize * 1.4;
  const blockHeight = lines.length * lineHeight + padding * 2;
  const blockY = canvas.height - blockHeight - baseFontSize;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(
    padding,
    blockY,
    canvas.width - padding * 2,
    blockHeight,
    baseFontSize * 0.4
  );
  ctx.fill();

  ctx.font = `bold ${baseFontSize}px monospace`;
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    const y = blockY + padding + i * lineHeight;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText(line, padding * 2 + 2, y + 2);
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, padding * 2, y);
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

function getLocation(): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function MainPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stampedUrl, setStampedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stamp, setStamp] = useState<StampData | null>(null);

  const handleCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setStampedUrl(null);

      const datetime = new Date().toISOString();
      const coords = await getLocation();

      const stampData: StampData = {
        datetime,
        lat: coords?.latitude ?? null,
        lon: coords?.longitude ?? null,
      };
      setStamp(stampData);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const url = drawStamp(img, stampData);
          setStampedUrl(url);
          setLoading(false);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    []
  );

  const handleDownload = useCallback(() => {
    if (!stampedUrl) return;
    const a = document.createElement('a');
    a.href = stampedUrl;
    a.download = `stampimg_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    a.click();
  }, [stampedUrl]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
      }}
    >
      {/* Capture button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
      />

      <Button
        variant="contained"
        size="large"
        startIcon={<CameraAltIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        sx={{ mb: 4, px: 5, py: 1.5, fontSize: 18 }}
      >
        Take Photo
      </Button>

      {/* Loading */}
      {loading && (
        <Stack alignItems="center" spacing={2} mb={3}>
          <CircularProgress />
          <Typography color="text.secondary" variant="body2">
            Fetching location & stamping…
          </Typography>
        </Stack>
      )}

      {/* Preview */}
      {stampedUrl && !loading && (
        <Stack alignItems="center" spacing={3} width="100%" maxWidth={600}>
          <Paper
            elevation={6}
            sx={{ overflow: 'hidden', width: '100%', borderRadius: 3 }}
          >
            <img
              src={stampedUrl}
              alt="Stamped"
              style={{ width: '100%', display: 'block' }}
            />
          </Paper>

          {stamp && (
            <Paper
              sx={{
                px: 3,
                py: 2,
                width: '100%',
                bgcolor: '#fff',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Date / Time
              </Typography>
              <Typography variant="body2" fontFamily="monospace" mb={1}>
                {stamp.datetime}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Coordinates
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {stamp.lat !== null && stamp.lon !== null
                  ? `${stamp.lat.toFixed(6)}, ${stamp.lon.toFixed(6)}`
                  : 'Location unavailable'}
              </Typography>
            </Paper>
          )}

          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            fullWidth
            sx={{ py: 1.5, fontSize: 16 }}
          >
            Save Photo
          </Button>
        </Stack>
      )}

      {/* Empty state */}
      {!stampedUrl && !loading && (
        <Typography color="text.secondary" variant="body2" textAlign="center" mt={2}>
          Take a photo to stamp it with the current date, time, and GPS location.
        </Typography>
      )}
    </Box>
  );
}
