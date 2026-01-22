/**
 * Qwen-Image API Client
 * Implements async polling pattern for image generation
 *
 * API Pattern:
 * 1. POST /v1/images/generations - Create task (returns task_id)
 * 2. GET /v1/tasks/{task_id} - Poll status every 5s
 * 3. Return when SUCCEED or FAILED
 */

// Lazy client initialization
function getClient() {
  // Note: Qwen-Image uses a different base URL (without /v1 suffix)
  const baseURL = process.env.QWEN_IMAGE_BASE_URL || 'https://api-inference.modelscope.cn/';
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey) {
    throw new Error('QWEN_API_KEY is not configured');
  }

  return { baseURL, apiKey };
}

interface CreateTaskResponse {
  task_id: string;
}

interface TaskStatusResponse {
  task_status: 'PENDING' | 'RUNNING' | 'SUCCEED' | 'FAILED';
  output_images?: string[];
}

interface PollingOptions {
  maxAttempts?: number; // Default: 24 (2 minutes at 5s intervals)
  intervalMs?: number; // Default: 5000 (5 seconds)
  onProgress?: (attempt: number, status: string) => void;
}

/**
 * Generate image using async polling pattern
 * @param prompt - Text prompt for image generation
 * @param options - Polling configuration
 * @returns Image URL when generation completes
 */
export async function generateImage(
  prompt: string,
  options: PollingOptions = {}
): Promise<string> {
  const {
    maxAttempts = 24,
    intervalMs = 5000,
    onProgress,
  } = options;

  const client = getClient();
  const model = process.env.QWEN_IMAGE_MODEL || 'Qwen/Qwen-Image-2512';

  console.log('Qwen-Image Client Config:', {
    baseURL: client.baseURL,
    model,
    hasApiKey: !!client.apiKey,
    promptLength: prompt.length,
  });

  // Step 1: Create task
  const taskId = await createImageTask(client.baseURL, client.apiKey, model, prompt);
  console.log('Created image generation task:', taskId);

  // Step 2: Poll for completion
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onProgress?.(attempt, `Generating image... (${attempt}/${maxAttempts})`);

    // Wait before polling (except first attempt)
    if (attempt > 1) {
      await sleep(intervalMs);
    }

    const result = await getTaskStatus(client.baseURL, taskId);

    if (result.task_status === 'SUCCEED') {
      if (!result.output_images || result.output_images.length === 0) {
        throw new Error('Task succeeded but no images returned');
      }
      console.log('Image generation completed:', result.output_images[0]);
      return result.output_images[0];
    }

    if (result.task_status === 'FAILED') {
      throw new Error('Image generation task failed');
    }

    // Continue polling for PENDING or RUNNING
  }

  throw new Error(`Image generation timeout after ${maxAttempts} attempts`);
}

/**
 * Create image generation task
 */
async function createImageTask(
  baseURL: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const url = `${baseURL}v1/images/generations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-ModelScope-Async-Mode': 'true', // Critical for async mode
    },
    body: JSON.stringify({
      model,
      prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create image task: ${response.status} ${errorText}`);
  }

  const data: CreateTaskResponse = await response.json();
  return data.task_id;
}

/**
 * Get task status
 */
async function getTaskStatus(
  baseURL: string,
  taskId: string
): Promise<TaskStatusResponse> {
  const url = `${baseURL}v1/tasks/${taskId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getClient().apiKey}`,
      'X-ModelScope-Task-Type': 'image_generation',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.status}`);
  }

  return await response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
