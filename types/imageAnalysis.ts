/**
 * Image analysis types for Qwen3-VL integration
 */

export type ImageAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface ImageAnalysisResult {
  id: string;
  productId: string;
  imageIndex: number;
  imageUrl: string;

  // Analysis output
  sellingPoints: string[]; // 3-5 visual selling points extracted from image
  keywords: string[]; // 5-10 visual keywords/tags
  visualFeatures: {
    colors: string[]; // Dominant colors detected
    style: string; // Visual style (e.g., minimalist, luxury, casual)
    scene?: string; // Scene context if applicable
  };

  status: ImageAnalysisStatus;
  error?: string;
  analyzedAt?: Date;
}

// Map for storing multiple image analyses per product
// Key: ${productId}-${imageIndex}
export type ImageAnalysisMap = Map<string, ImageAnalysisResult>;
