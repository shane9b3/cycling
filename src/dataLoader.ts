/**
 * Data loading functions with comprehensive error handling
 */

import * as fs from "fs";
import * as path from "path";
import {
  Workout,
  Video,
  WorkoutDetails,
  WorkoutSegment,
  DataLoadError,
  NetworkError,
} from "./types";

/**
 * Configuration for network requests
 */
interface FetchConfig {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

const DEFAULT_FETCH_CONFIG: Required<FetchConfig> = {
  timeoutMs: 30000,
  retries: 3,
  retryDelayMs: 1000,
};

/**
 * Safely reads and parses a JSON file with comprehensive error handling
 *
 * @param filePath - Absolute or relative path to the JSON file
 * @returns Parsed JSON data
 * @throws DataLoadError if file cannot be read or parsed
 */
export function loadJsonFile<T>(filePath: string): T {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    throw new DataLoadError(
      `File not found: ${absolutePath}`,
      absolutePath
    );
  }

  // Check if path is a file (not a directory)
  const stats = fs.statSync(absolutePath);
  if (!stats.isFile()) {
    throw new DataLoadError(
      `Path is not a file: ${absolutePath}`,
      absolutePath
    );
  }

  // Read file content
  let content: string;
  try {
    content = fs.readFileSync(absolutePath, "utf-8");
  } catch (error) {
    throw new DataLoadError(
      `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
      absolutePath,
      error instanceof Error ? error : undefined
    );
  }

  // Check for empty file
  if (!content.trim()) {
    throw new DataLoadError(
      "File is empty",
      absolutePath
    );
  }

  // Parse JSON
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new DataLoadError(
      `Invalid JSON: ${error instanceof Error ? error.message : "Parse error"}`,
      absolutePath,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Loads the workouts.json file with error handling
 *
 * @param filePath - Path to workouts.json (default: ./workouts.json)
 * @returns Array of Workout objects
 * @throws DataLoadError if file cannot be loaded or is invalid
 */
export function loadWorkouts(filePath: string = "./workouts.json"): Workout[] {
  const data = loadJsonFile<unknown>(filePath);

  // Validate it's an array
  if (!Array.isArray(data)) {
    throw new DataLoadError(
      `Expected array but got ${typeof data}`,
      filePath
    );
  }

  // Validate each workout has required fields
  const workouts: Workout[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (typeof item !== "object" || item === null) {
      throw new DataLoadError(
        `Workout at index ${i} is not an object`,
        filePath
      );
    }

    const workout = item as Record<string, unknown>;

    if (typeof workout.Title !== "string") {
      throw new DataLoadError(
        `Workout at index ${i} is missing required field 'Title' or it is not a string`,
        filePath
      );
    }

    if (typeof workout.Image !== "string") {
      throw new DataLoadError(
        `Workout at index ${i} (${workout.Title}) is missing required field 'Image' or it is not a string`,
        filePath
      );
    }

    if (typeof workout.Workout_URL !== "string") {
      throw new DataLoadError(
        `Workout at index ${i} (${workout.Title}) is missing required field 'Workout_URL' or it is not a string`,
        filePath
      );
    }

    workouts.push({
      Title: workout.Title,
      Image: workout.Image,
      Workout_URL: workout.Workout_URL,
    });
  }

  return workouts;
}

/**
 * Loads the videos.json file with error handling
 *
 * @param filePath - Path to videos.json (default: ./videos.json)
 * @returns Array of Video objects
 * @throws DataLoadError if file cannot be loaded or is invalid
 */
export function loadVideos(filePath: string = "./videos.json"): Video[] {
  const data = loadJsonFile<unknown>(filePath);

  // Validate it's an array
  if (!Array.isArray(data)) {
    throw new DataLoadError(
      `Expected array but got ${typeof data}`,
      filePath
    );
  }

  // Validate each video has required fields
  const videos: Video[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (typeof item !== "object" || item === null) {
      throw new DataLoadError(
        `Video at index ${i} is not an object`,
        filePath
      );
    }

    const video = item as Record<string, unknown>;

    if (typeof video.Title !== "string") {
      throw new DataLoadError(
        `Video at index ${i} is missing required field 'Title' or it is not a string`,
        filePath
      );
    }

    if (typeof video.Subtitle !== "string") {
      throw new DataLoadError(
        `Video at index ${i} (${video.Title}) is missing required field 'Subtitle' or it is not a string`,
        filePath
      );
    }

    if (typeof video.Image !== "string") {
      throw new DataLoadError(
        `Video at index ${i} (${video.Title}) is missing required field 'Image' or it is not a string`,
        filePath
      );
    }

    if (typeof video.Video !== "string") {
      throw new DataLoadError(
        `Video at index ${i} (${video.Title}) is missing required field 'Video' or it is not a string`,
        filePath
      );
    }

    videos.push({
      Title: video.Title,
      Subtitle: video.Subtitle,
      Image: video.Image,
      Video: video.Video,
    });
  }

  return videos;
}

/**
 * Loads a workout details file with error handling
 *
 * @param filePath - Path to workout details JSON file
 * @returns Array of WorkoutSegment objects
 * @throws DataLoadError if file cannot be loaded or is invalid
 */
export function loadWorkoutDetails(filePath: string): WorkoutDetails {
  const data = loadJsonFile<unknown>(filePath);

  // Validate it's an array
  if (!Array.isArray(data)) {
    throw new DataLoadError(
      `Expected array but got ${typeof data}`,
      filePath
    );
  }

  if (data.length === 0) {
    throw new DataLoadError(
      "Workout details array is empty",
      filePath
    );
  }

  // Validate each segment has required fields
  const segments: WorkoutSegment[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (typeof item !== "object" || item === null) {
      throw new DataLoadError(
        `Segment at index ${i} is not an object`,
        filePath
      );
    }

    const segment = item as Record<string, unknown>;

    // Validate Time
    if (typeof segment.Time !== "number" || !Number.isFinite(segment.Time)) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Time' field: expected a number, got ${typeof segment.Time}`,
        filePath
      );
    }
    if (segment.Time <= 0) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Time' value: ${segment.Time} (must be positive)`,
        filePath
      );
    }

    // Validate Activity
    if (typeof segment.Activity !== "string") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Activity' field: expected a string, got ${typeof segment.Activity}`,
        filePath
      );
    }

    // Validate Resistance
    if (typeof segment.Resistance !== "number" || !Number.isFinite(segment.Resistance)) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Resistance' field: expected a number, got ${typeof segment.Resistance}`,
        filePath
      );
    }
    if (segment.Resistance < 0 || segment.Resistance > 20) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Resistance' value: ${segment.Resistance} (expected 0-20)`,
        filePath
      );
    }

    // Validate Cadence
    if (typeof segment.Cadence !== "number" || !Number.isFinite(segment.Cadence)) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Cadence' field: expected a number, got ${typeof segment.Cadence}`,
        filePath
      );
    }
    if (segment.Cadence < 0 || segment.Cadence > 150) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Cadence' value: ${segment.Cadence} (expected 0-150)`,
        filePath
      );
    }

    // Validate Stroke instruction (can be empty string)
    if (typeof segment["Stroke instruction"] !== "string") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Stroke instruction' field: expected a string, got ${typeof segment["Stroke instruction"]}`,
        filePath
      );
    }

    // Validate Elapsed Time
    if (typeof segment["Elapsed Time"] !== "number" || !Number.isFinite(segment["Elapsed Time"])) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Elapsed Time' field: expected a number, got ${typeof segment["Elapsed Time"]}`,
        filePath
      );
    }
    if (segment["Elapsed Time"] < 0) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Elapsed Time' value: ${segment["Elapsed Time"]} (must be non-negative)`,
        filePath
      );
    }

    segments.push({
      Time: segment.Time,
      Activity: segment.Activity,
      Resistance: segment.Resistance,
      Cadence: segment.Cadence,
      "Stroke instruction": segment["Stroke instruction"],
      "Elapsed Time": segment["Elapsed Time"],
    });
  }

  return segments;
}

/**
 * Fetches data from a URL with timeout and retry support
 *
 * @param url - URL to fetch
 * @param config - Optional fetch configuration
 * @returns Response data as string
 * @throws NetworkError if fetch fails after all retries
 */
export async function fetchWithRetry(
  url: string,
  config: FetchConfig = {}
): Promise<string> {
  const { timeoutMs, retries, retryDelayMs } = {
    ...DEFAULT_FETCH_CONFIG,
    ...config,
  };

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new NetworkError(
      `Invalid URL format: ${url}`,
      url
    );
  }

  // Only allow http and https protocols
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new NetworkError(
      `Unsupported protocol: ${parsedUrl.protocol}`,
      url
    );
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "CyclingDataLoader/1.0",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new NetworkError(
            `HTTP error ${response.status}: ${response.statusText}`,
            url,
            response.status
          );
        }

        return await response.text();
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on non-retriable errors
      if (error instanceof NetworkError && error.statusCode) {
        const nonRetriable = [400, 401, 403, 404, 405, 422];
        if (nonRetriable.includes(error.statusCode)) {
          throw error;
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new NetworkError(
    `Failed after ${retries + 1} attempts: ${lastError?.message}`,
    url,
    undefined,
    lastError
  );
}

/**
 * Fetches and parses workout details from a remote URL
 *
 * @param url - URL to the workout details JSON
 * @param config - Optional fetch configuration
 * @returns Array of WorkoutSegment objects
 * @throws NetworkError if fetch fails
 * @throws DataLoadError if JSON is invalid
 */
export async function fetchWorkoutDetails(
  url: string,
  config?: FetchConfig
): Promise<WorkoutDetails> {
  const content = await fetchWithRetry(url, config);

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (error) {
    throw new DataLoadError(
      `Invalid JSON from URL: ${error instanceof Error ? error.message : "Parse error"}`,
      url,
      error instanceof Error ? error : undefined
    );
  }

  // Re-use the same validation logic
  if (!Array.isArray(data)) {
    throw new DataLoadError(
      `Expected array but got ${typeof data}`,
      url
    );
  }

  // Validate each segment (same as loadWorkoutDetails)
  const segments: WorkoutSegment[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (typeof item !== "object" || item === null) {
      throw new DataLoadError(
        `Segment at index ${i} is not an object`,
        url
      );
    }

    const segment = item as Record<string, unknown>;

    // Validate all required fields
    if (typeof segment.Time !== "number" || segment.Time <= 0) {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Time' field`,
        url
      );
    }

    if (typeof segment.Activity !== "string") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Activity' field`,
        url
      );
    }

    if (typeof segment.Resistance !== "number") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Resistance' field`,
        url
      );
    }

    if (typeof segment.Cadence !== "number") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Cadence' field`,
        url
      );
    }

    if (typeof segment["Stroke instruction"] !== "string") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Stroke instruction' field`,
        url
      );
    }

    if (typeof segment["Elapsed Time"] !== "number") {
      throw new DataLoadError(
        `Segment at index ${i} has invalid 'Elapsed Time' field`,
        url
      );
    }

    segments.push({
      Time: segment.Time,
      Activity: segment.Activity,
      Resistance: segment.Resistance,
      Cadence: segment.Cadence,
      "Stroke instruction": segment["Stroke instruction"],
      "Elapsed Time": segment["Elapsed Time"],
    });
  }

  return segments;
}

/**
 * Safely gets a workout segment by index with bounds checking
 *
 * @param segments - Array of workout segments
 * @param index - Index to access
 * @returns The segment at the given index
 * @throws DataLoadError if index is out of bounds
 */
export function getSegmentAtIndex(
  segments: WorkoutDetails,
  index: number
): WorkoutSegment {
  if (index < 0 || index >= segments.length) {
    throw new DataLoadError(
      `Segment index ${index} is out of bounds (array length: ${segments.length})`,
      "memory"
    );
  }
  return segments[index];
}

/**
 * Safely gets the current segment based on elapsed time
 *
 * @param segments - Array of workout segments
 * @param elapsedMinutes - Current elapsed time in minutes
 * @returns The current segment, or null if workout is complete
 */
export function getCurrentSegment(
  segments: WorkoutDetails,
  elapsedMinutes: number
): WorkoutSegment | null {
  if (segments.length === 0) {
    return null;
  }

  if (elapsedMinutes < 0) {
    return segments[0];
  }

  for (const segment of segments) {
    if (elapsedMinutes <= segment["Elapsed Time"]) {
      return segment;
    }
  }

  // Workout complete
  return null;
}
