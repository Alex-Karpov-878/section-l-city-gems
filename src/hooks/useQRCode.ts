import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: {
    dark?: string;
    light?: string;
  };
  margin?: number;
}

export interface UseQRCodeResult {
  dataUrl: string | null;
  svg: string | null;
  isLoading: boolean;
  error: Error | null;
  generate: (data: string, options?: QRCodeOptions) => Promise<void>;
  download: (filename?: string) => void;
  copyToClipboard: () => Promise<void>;
}

const DEFAULT_OPTIONS: Required<QRCodeOptions> = {
  size: 256,
  errorCorrectionLevel: "M",
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
  margin: 4,
};

export function useQRCode(
  initialData?: string,
  initialOptions?: QRCodeOptions
): UseQRCodeResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [options, setOptions] = useState<Required<QRCodeOptions>>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  });

  const generate = useCallback(
    async (data: string, newOptions?: QRCodeOptions) => {
      if (!data) {
        setError(new Error("Data is required to generate QR code"));
        return;
      }

      setIsLoading(true);
      setError(null);

      const mergedOptions = {
        ...options,
        ...newOptions,
      };
      setOptions(mergedOptions);

      try {
        const url = await QRCode.toDataURL(data, {
          width: mergedOptions.size,
          errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
          color: mergedOptions.color,
          margin: mergedOptions.margin,
        });
        setDataUrl(url);

        const svgString = await QRCode.toString(data, {
          type: "svg",
          width: mergedOptions.size,
          errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
          color: mergedOptions.color,
          margin: mergedOptions.margin,
        });
        setSvg(svgString);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err : new Error("Failed to generate QR code");
        setError(errorMessage);
        console.error("QR code generation error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const download = useCallback(
    (filename: string = "qr-code.png") => {
      if (!dataUrl) {
        console.warn("No QR code generated yet");
        return;
      }

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [dataUrl]
  );

  const copyToClipboard = useCallback(async () => {
    if (!dataUrl) {
      throw new Error("No QR code generated yet");
    }

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } catch (err) {
      console.error("Failed to copy QR code to clipboard:", err);
      throw new Error("Failed to copy QR code to clipboard");
    }
  }, [dataUrl]);

  useEffect(() => {
    if (initialData) {
      generate(initialData, initialOptions);
    }
  }, []);

  return {
    dataUrl,
    svg,
    isLoading,
    error,
    generate,
    download,
    copyToClipboard,
  };
}

export function useQRCodeDataUrl(
  data: string,
  options?: QRCodeOptions
): string | null {
  const { dataUrl } = useQRCode(data, options);
  return dataUrl;
}
