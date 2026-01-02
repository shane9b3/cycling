#!/usr/bin/env ts-node
/**
 * Data validation script
 *
 * This script validates all JSON data files in the repository and reports
 * any errors or warnings found.
 */

import * as path from "path";
import { loadJsonFile, DataLoadError } from "./dataLoader";
import {
  validateWorkoutsList,
  validateVideosList,
  validateWorkoutDetails,
} from "./validators";

interface ValidationSummary {
  file: string;
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
}

function validateFile(
  filePath: string,
  validator: (data: unknown) => { valid: boolean; errors: string[]; warnings: string[] }
): ValidationSummary {
  const summary: ValidationSummary = {
    file: filePath,
    valid: true,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
  };

  try {
    const data = loadJsonFile<unknown>(filePath);
    const result = validator(data);

    summary.valid = result.valid;
    summary.errors = result.errors;
    summary.warnings = result.warnings;
    summary.errorCount = result.errors.length;
    summary.warningCount = result.warnings.length;
  } catch (error) {
    summary.valid = false;
    if (error instanceof DataLoadError) {
      summary.errors.push(`Load error: ${error.message}`);
    } else if (error instanceof Error) {
      summary.errors.push(`Unexpected error: ${error.message}`);
    } else {
      summary.errors.push(`Unknown error: ${String(error)}`);
    }
    summary.errorCount = summary.errors.length;
  }

  return summary;
}

function printSummary(summary: ValidationSummary): void {
  const status = summary.valid ? "✓ VALID" : "✗ INVALID";
  console.log(`\n${"=".repeat(60)}`);
  console.log(`File: ${summary.file}`);
  console.log(`Status: ${status}`);
  console.log(`Errors: ${summary.errorCount}, Warnings: ${summary.warningCount}`);

  if (summary.errors.length > 0) {
    console.log("\nErrors:");
    summary.errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (summary.warnings.length > 0) {
    console.log("\nWarnings:");
    summary.warnings.forEach((warn) => console.log(`  - ${warn}`));
  }
}

async function main(): Promise<void> {
  console.log("Cycling Data Validation Report");
  console.log("==============================\n");

  const baseDir = path.resolve(__dirname, "..");
  const summaries: ValidationSummary[] = [];

  // Validate workouts.json
  summaries.push(
    validateFile(
      path.join(baseDir, "workouts.json"),
      validateWorkoutsList
    )
  );

  // Validate videos.json
  summaries.push(
    validateFile(
      path.join(baseDir, "videos.json"),
      validateVideosList
    )
  );

  // Validate workout details files
  const workoutDetailsFiles = [
    "30_Minute_Workout.json",
    "Greek_City_45_Min.json",
    "10_Minute_High_Intensity.json",
    "test.json",
  ];

  for (const file of workoutDetailsFiles) {
    summaries.push(
      validateFile(
        path.join(baseDir, "workoutdetails", file),
        validateWorkoutDetails
      )
    );
  }

  // Print all summaries
  summaries.forEach(printSummary);

  // Print overall summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("OVERALL SUMMARY");
  console.log("=".repeat(60));

  const totalErrors = summaries.reduce((sum, s) => sum + s.errorCount, 0);
  const totalWarnings = summaries.reduce((sum, s) => sum + s.warningCount, 0);
  const invalidFiles = summaries.filter((s) => !s.valid).length;

  console.log(`Total files checked: ${summaries.length}`);
  console.log(`Valid files: ${summaries.length - invalidFiles}`);
  console.log(`Invalid files: ${invalidFiles}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);

  if (invalidFiles > 0) {
    console.log("\nInvalid files:");
    summaries
      .filter((s) => !s.valid)
      .forEach((s) => console.log(`  - ${s.file}`));
  }

  // Exit with error code if any files are invalid
  process.exit(invalidFiles > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
