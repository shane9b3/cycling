/**
 * Cycling Data Utilities
 *
 * A comprehensive library for loading and validating cycling workout data
 * with proper error handling.
 */

// Export types
export {
  Workout,
  Video,
  WorkoutSegment,
  WorkoutDetails,
  DataLoadError,
  DataValidationError,
  NetworkError,
  ValidationResult,
} from "./types";

// Export data loading functions
export {
  loadJsonFile,
  loadWorkouts,
  loadVideos,
  loadWorkoutDetails,
  fetchWithRetry,
  fetchWorkoutDetails,
  getSegmentAtIndex,
  getCurrentSegment,
} from "./dataLoader";

// Export validation functions
export {
  validateUrl,
  validateWorkout,
  validateVideo,
  validateSegment,
  validateWorkoutDetails,
  validateWorkoutsList,
  validateVideosList,
  assertDefined,
  assertNumberInRange,
  assertNonEmptyString,
} from "./validators";
