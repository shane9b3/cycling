/**
 * Type definitions for the cycling workout data
 */

export interface Workout {
  Title: string;
  Image: string;
  Workout_URL: string;
}

export interface Video {
  Title: string;
  Subtitle: string;
  Image: string;
  Video: string;
}

export interface WorkoutSegment {
  Time: number;
  Activity: string;
  Resistance: number;
  Cadence: number;
  "Stroke instruction": string;
  "Elapsed Time": number;
}

export type WorkoutDetails = WorkoutSegment[];

/**
 * Error types for better error handling
 */
export class DataLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "DataLoadError";
  }
}

export class DataValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = "DataValidationError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly statusCode?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
