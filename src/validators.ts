/**
 * Validation functions for cycling workout data
 */

import {
  Workout,
  Video,
  WorkoutDetails,
  WorkoutSegment,
  ValidationResult,
  DataValidationError,
} from "./types";

/**
 * Valid activity types for workout segments
 */
const VALID_ACTIVITIES = [
  "Warm-up",
  "Intervals",
  "Recovery",
  "Cool-down",
  "Bonus Interval",
  "Standing Jog",
  "Satnding Jog", // Known typo in data
  "Winding Streets",
  "Seated Climb",
  "Sprint",
  "Hill Climb",
  "Endurance",
] as const;

/**
 * Validation constraints
 */
const CONSTRAINTS = {
  minResistance: 1,
  maxResistance: 20,
  minCadence: 30,
  maxCadence: 150,
  minTime: 1,
  maxTime: 60,
  maxElapsedTime: 120,
} as const;

/**
 * Validates a URL format and checks for allowed domains
 *
 * @param url - URL to validate
 * @param allowedDomains - Optional list of allowed domains
 * @returns Validation result
 */
export function validateUrl(
  url: string,
  allowedDomains?: string[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if URL is empty
  if (!url || url.trim() === "") {
    result.valid = false;
    result.errors.push("URL is empty");
    return result;
  }

  // Parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    result.valid = false;
    result.errors.push(`Invalid URL format: ${url}`);
    return result;
  }

  // Check protocol
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    result.valid = false;
    result.errors.push(`Invalid protocol: ${parsedUrl.protocol} (expected http or https)`);
    return result;
  }

  // Warn about http (not https)
  if (parsedUrl.protocol === "http:") {
    result.warnings.push("URL uses insecure HTTP protocol");
  }

  // Check allowed domains
  if (allowedDomains && allowedDomains.length > 0) {
    const domain = parsedUrl.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(
      (allowed) =>
        domain === allowed.toLowerCase() ||
        domain.endsWith(`.${allowed.toLowerCase()}`)
    );

    if (!isAllowed) {
      result.valid = false;
      result.errors.push(
        `Domain '${domain}' is not in allowed list: ${allowedDomains.join(", ")}`
      );
    }
  }

  return result;
}

/**
 * Validates a workout object
 *
 * @param workout - Workout to validate
 * @returns Validation result
 */
export function validateWorkout(workout: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if it's an object
  if (typeof workout !== "object" || workout === null) {
    result.valid = false;
    result.errors.push(`Workout must be an object, got ${typeof workout}`);
    return result;
  }

  const w = workout as Record<string, unknown>;

  // Validate Title
  if (typeof w.Title !== "string") {
    result.valid = false;
    result.errors.push(`Title must be a string, got ${typeof w.Title}`);
  } else if (w.Title.trim() === "") {
    result.valid = false;
    result.errors.push("Title cannot be empty");
  }

  // Validate Image URL
  if (typeof w.Image !== "string") {
    result.valid = false;
    result.errors.push(`Image must be a string, got ${typeof w.Image}`);
  } else {
    const urlResult = validateUrl(w.Image, [
      "amazonaws.com",
      "github.com",
      "githubusercontent.com",
    ]);
    if (!urlResult.valid) {
      result.valid = false;
      result.errors.push(...urlResult.errors.map((e) => `Image URL: ${e}`));
    }
    result.warnings.push(...urlResult.warnings.map((w) => `Image URL: ${w}`));
  }

  // Validate Workout_URL
  if (typeof w.Workout_URL !== "string") {
    result.valid = false;
    result.errors.push(`Workout_URL must be a string, got ${typeof w.Workout_URL}`);
  } else {
    const urlResult = validateUrl(w.Workout_URL, [
      "github.com",
      "githubusercontent.com",
      "raw.githubusercontent.com",
    ]);
    if (!urlResult.valid) {
      result.valid = false;
      result.errors.push(...urlResult.errors.map((e) => `Workout_URL: ${e}`));
    }
    result.warnings.push(...urlResult.warnings.map((w) => `Workout_URL: ${w}`));

    // Check if URL ends with .json
    if (w.Workout_URL && !w.Workout_URL.toLowerCase().endsWith(".json")) {
      result.warnings.push("Workout_URL does not end with .json extension");
    }
  }

  return result;
}

/**
 * Validates a video object
 *
 * @param video - Video to validate
 * @returns Validation result
 */
export function validateVideo(video: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if it's an object
  if (typeof video !== "object" || video === null) {
    result.valid = false;
    result.errors.push(`Video must be an object, got ${typeof video}`);
    return result;
  }

  const v = video as Record<string, unknown>;

  // Validate Title
  if (typeof v.Title !== "string") {
    result.valid = false;
    result.errors.push(`Title must be a string, got ${typeof v.Title}`);
  } else if (v.Title.trim() === "") {
    result.valid = false;
    result.errors.push("Title cannot be empty");
  }

  // Validate Subtitle
  if (typeof v.Subtitle !== "string") {
    result.valid = false;
    result.errors.push(`Subtitle must be a string, got ${typeof v.Subtitle}`);
  }

  // Validate Image URL
  if (typeof v.Image !== "string") {
    result.valid = false;
    result.errors.push(`Image must be a string, got ${typeof v.Image}`);
  } else {
    const urlResult = validateUrl(v.Image, [
      "amazonaws.com",
      "github.com",
      "githubusercontent.com",
    ]);
    if (!urlResult.valid) {
      result.valid = false;
      result.errors.push(...urlResult.errors.map((e) => `Image URL: ${e}`));
    }
    result.warnings.push(...urlResult.warnings.map((w) => `Image URL: ${w}`));
  }

  // Validate Video URL
  if (typeof v.Video !== "string") {
    result.valid = false;
    result.errors.push(`Video must be a string, got ${typeof v.Video}`);
  } else {
    const urlResult = validateUrl(v.Video, [
      "amazonaws.com",
    ]);
    if (!urlResult.valid) {
      result.valid = false;
      result.errors.push(...urlResult.errors.map((e) => `Video URL: ${e}`));
    }
    result.warnings.push(...urlResult.warnings.map((w) => `Video URL: ${w}`));

    // Check if URL ends with video extension
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi"];
    const hasVideoExt = videoExtensions.some((ext) =>
      v.Video.toLowerCase().endsWith(ext)
    );
    if (!hasVideoExt) {
      result.warnings.push(
        `Video URL does not end with a known video extension (${videoExtensions.join(", ")})`
      );
    }
  }

  return result;
}

/**
 * Validates a workout segment
 *
 * @param segment - Segment to validate
 * @param index - Index of the segment (for error messages)
 * @param previousElapsedTime - Expected elapsed time based on previous segments
 * @returns Validation result
 */
export function validateSegment(
  segment: unknown,
  index: number,
  previousElapsedTime: number = 0
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if it's an object
  if (typeof segment !== "object" || segment === null) {
    result.valid = false;
    result.errors.push(`Segment ${index} must be an object, got ${typeof segment}`);
    return result;
  }

  const s = segment as Record<string, unknown>;

  // Validate Time
  if (typeof s.Time !== "number") {
    result.valid = false;
    result.errors.push(`Segment ${index}: Time must be a number, got ${typeof s.Time}`);
  } else if (!Number.isFinite(s.Time)) {
    result.valid = false;
    result.errors.push(`Segment ${index}: Time must be a finite number`);
  } else if (s.Time < CONSTRAINTS.minTime) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Time ${s.Time} is less than minimum ${CONSTRAINTS.minTime}`
    );
  } else if (s.Time > CONSTRAINTS.maxTime) {
    result.warnings.push(
      `Segment ${index}: Time ${s.Time} exceeds typical maximum ${CONSTRAINTS.maxTime}`
    );
  }

  // Validate Activity
  if (typeof s.Activity !== "string") {
    result.valid = false;
    result.errors.push(`Segment ${index}: Activity must be a string, got ${typeof s.Activity}`);
  } else if (s.Activity.trim() === "") {
    result.valid = false;
    result.errors.push(`Segment ${index}: Activity cannot be empty`);
  } else if (!VALID_ACTIVITIES.includes(s.Activity as typeof VALID_ACTIVITIES[number])) {
    result.warnings.push(
      `Segment ${index}: Activity '${s.Activity}' is not a recognized activity type`
    );
  }

  // Validate Resistance
  if (typeof s.Resistance !== "number") {
    result.valid = false;
    result.errors.push(`Segment ${index}: Resistance must be a number, got ${typeof s.Resistance}`);
  } else if (!Number.isFinite(s.Resistance)) {
    result.valid = false;
    result.errors.push(`Segment ${index}: Resistance must be a finite number`);
  } else if (s.Resistance < CONSTRAINTS.minResistance) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Resistance ${s.Resistance} is less than minimum ${CONSTRAINTS.minResistance}`
    );
  } else if (s.Resistance > CONSTRAINTS.maxResistance) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Resistance ${s.Resistance} exceeds maximum ${CONSTRAINTS.maxResistance}`
    );
  }

  // Validate Cadence
  if (typeof s.Cadence !== "number") {
    result.valid = false;
    result.errors.push(`Segment ${index}: Cadence must be a number, got ${typeof s.Cadence}`);
  } else if (!Number.isFinite(s.Cadence)) {
    result.valid = false;
    result.errors.push(`Segment ${index}: Cadence must be a finite number`);
  } else if (s.Cadence < CONSTRAINTS.minCadence) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Cadence ${s.Cadence} is less than minimum ${CONSTRAINTS.minCadence}`
    );
  } else if (s.Cadence > CONSTRAINTS.maxCadence) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Cadence ${s.Cadence} exceeds maximum ${CONSTRAINTS.maxCadence}`
    );
  }

  // Validate Stroke instruction (can be empty)
  if (typeof s["Stroke instruction"] !== "string") {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Stroke instruction must be a string, got ${typeof s["Stroke instruction"]}`
    );
  }

  // Validate Elapsed Time
  if (typeof s["Elapsed Time"] !== "number") {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Elapsed Time must be a number, got ${typeof s["Elapsed Time"]}`
    );
  } else if (!Number.isFinite(s["Elapsed Time"])) {
    result.valid = false;
    result.errors.push(`Segment ${index}: Elapsed Time must be a finite number`);
  } else if (s["Elapsed Time"] < 0) {
    result.valid = false;
    result.errors.push(
      `Segment ${index}: Elapsed Time ${s["Elapsed Time"]} cannot be negative`
    );
  } else if (s["Elapsed Time"] > CONSTRAINTS.maxElapsedTime) {
    result.warnings.push(
      `Segment ${index}: Elapsed Time ${s["Elapsed Time"]} exceeds typical workout duration`
    );
  } else if (typeof s.Time === "number" && Number.isFinite(s.Time)) {
    // Check elapsed time consistency
    const expectedElapsed = previousElapsedTime + s.Time;
    if (s["Elapsed Time"] !== expectedElapsed) {
      result.valid = false;
      result.errors.push(
        `Segment ${index}: Elapsed Time ${s["Elapsed Time"]} does not match expected ${expectedElapsed} ` +
          `(previous: ${previousElapsedTime} + current Time: ${s.Time})`
      );
    }
  }

  return result;
}

/**
 * Validates an entire workout details array
 *
 * @param workoutDetails - Array of segments to validate
 * @returns Validation result with all errors and warnings
 */
export function validateWorkoutDetails(workoutDetails: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if it's an array
  if (!Array.isArray(workoutDetails)) {
    result.valid = false;
    result.errors.push(`Workout details must be an array, got ${typeof workoutDetails}`);
    return result;
  }

  // Check if array is empty
  if (workoutDetails.length === 0) {
    result.valid = false;
    result.errors.push("Workout details array is empty");
    return result;
  }

  // Validate each segment
  let previousElapsedTime = 0;
  for (let i = 0; i < workoutDetails.length; i++) {
    const segmentResult = validateSegment(workoutDetails[i], i, previousElapsedTime);

    if (!segmentResult.valid) {
      result.valid = false;
    }
    result.errors.push(...segmentResult.errors);
    result.warnings.push(...segmentResult.warnings);

    // Update previous elapsed time for next iteration
    const segment = workoutDetails[i] as Record<string, unknown>;
    if (typeof segment.Time === "number" && Number.isFinite(segment.Time)) {
      previousElapsedTime += segment.Time;
    }
  }

  // Check for proper warm-up
  const firstSegment = workoutDetails[0] as Record<string, unknown>;
  if (
    typeof firstSegment.Activity === "string" &&
    firstSegment.Activity !== "Warm-up"
  ) {
    result.warnings.push(
      `Workout does not start with a Warm-up (starts with '${firstSegment.Activity}')`
    );
  }

  // Check for proper cool-down
  const lastSegment = workoutDetails[workoutDetails.length - 1] as Record<string, unknown>;
  if (
    typeof lastSegment.Activity === "string" &&
    lastSegment.Activity !== "Cool-down"
  ) {
    result.warnings.push(
      `Workout does not end with a Cool-down (ends with '${lastSegment.Activity}')`
    );
  }

  return result;
}

/**
 * Validates all workouts in an array
 *
 * @param workouts - Array of workouts to validate
 * @returns Combined validation result
 */
export function validateWorkoutsList(workouts: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!Array.isArray(workouts)) {
    result.valid = false;
    result.errors.push(`Workouts must be an array, got ${typeof workouts}`);
    return result;
  }

  if (workouts.length === 0) {
    result.warnings.push("Workouts array is empty");
  }

  for (let i = 0; i < workouts.length; i++) {
    const workoutResult = validateWorkout(workouts[i]);
    if (!workoutResult.valid) {
      result.valid = false;
    }
    result.errors.push(
      ...workoutResult.errors.map((e) => `Workout ${i}: ${e}`)
    );
    result.warnings.push(
      ...workoutResult.warnings.map((w) => `Workout ${i}: ${w}`)
    );
  }

  return result;
}

/**
 * Validates all videos in an array
 *
 * @param videos - Array of videos to validate
 * @returns Combined validation result
 */
export function validateVideosList(videos: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!Array.isArray(videos)) {
    result.valid = false;
    result.errors.push(`Videos must be an array, got ${typeof videos}`);
    return result;
  }

  if (videos.length === 0) {
    result.warnings.push("Videos array is empty");
  }

  for (let i = 0; i < videos.length; i++) {
    const videoResult = validateVideo(videos[i]);
    if (!videoResult.valid) {
      result.valid = false;
    }
    result.errors.push(
      ...videoResult.errors.map((e) => `Video ${i}: ${e}`)
    );
    result.warnings.push(
      ...videoResult.warnings.map((w) => `Video ${i}: ${w}`)
    );
  }

  return result;
}

/**
 * Asserts that a value is defined (not null or undefined)
 * Throws DataValidationError if the assertion fails
 *
 * @param value - Value to check
 * @param fieldName - Name of the field for error messages
 * @returns The value if it's defined
 * @throws DataValidationError if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw new DataValidationError(
      `${fieldName} is required but was ${value === null ? "null" : "undefined"}`,
      fieldName,
      value
    );
  }
  return value;
}

/**
 * Asserts that a value is a number within a range
 *
 * @param value - Value to check
 * @param fieldName - Name of the field for error messages
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns The value if it's valid
 * @throws DataValidationError if validation fails
 */
export function assertNumberInRange(
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number {
  if (typeof value !== "number") {
    throw new DataValidationError(
      `${fieldName} must be a number, got ${typeof value}`,
      fieldName,
      value
    );
  }

  if (!Number.isFinite(value)) {
    throw new DataValidationError(
      `${fieldName} must be a finite number`,
      fieldName,
      value
    );
  }

  if (value < min || value > max) {
    throw new DataValidationError(
      `${fieldName} must be between ${min} and ${max}, got ${value}`,
      fieldName,
      value
    );
  }

  return value;
}

/**
 * Asserts that a value is a non-empty string
 *
 * @param value - Value to check
 * @param fieldName - Name of the field for error messages
 * @returns The value if it's valid
 * @throws DataValidationError if validation fails
 */
export function assertNonEmptyString(
  value: unknown,
  fieldName: string
): string {
  if (typeof value !== "string") {
    throw new DataValidationError(
      `${fieldName} must be a string, got ${typeof value}`,
      fieldName,
      value
    );
  }

  if (value.trim() === "") {
    throw new DataValidationError(
      `${fieldName} cannot be empty`,
      fieldName,
      value
    );
  }

  return value;
}
