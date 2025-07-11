// Re-export necessary types from providers/interfaces.ts
// This avoids TypeScript rootDir issues

// Define JobStatusType locally to avoid import path issues
export type JobStatusType =
  | 'created'
  | 'submitted'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Additional types can be added here as needed
