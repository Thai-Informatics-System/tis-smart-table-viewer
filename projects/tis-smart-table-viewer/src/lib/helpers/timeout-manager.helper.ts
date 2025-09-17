/**
 * TimeoutManager - A utility class for managing timeouts to prevent memory leaks
 * 
 * This class provides a centralized way to create, track, and clean up setTimeout calls.
 * It automatically handles cleanup when component is destroyed to prevent memory leaks.
 * 
 * @example
 * ```typescript
 * export class MyComponent implements OnDestroy {
 *   private timeoutManager = new TimeoutManager();
 * 
 *   someMethod() {
 *     this.timeoutManager.createTimeout(() => {
 *       console.log('Delayed execution');
 *     }, 1000);
 *   }
 * 
 *   ngOnDestroy() {
 *     this.timeoutManager.clearAll(); // Clean up all pending timeouts
 *   }
 * }
 * ```
 */
export class TimeoutManager {
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  /**
   * Creates a tracked timeout that will be automatically cleaned up
   * @param callback - Function to execute after delay
   * @param delay - Delay in milliseconds
   * @returns The timeout ID (same as setTimeout return value)
   */
  createTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    const timeoutId = setTimeout(() => {
      // Auto-remove from tracking when timeout executes naturally
      this.activeTimeouts.delete(timeoutId);
      callback();
    }, delay);

    // Add to tracking set
    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  }

  /**
   * Manually clear a specific timeout
   * @param timeoutId - The timeout ID returned from createTimeout
   */
  clearTimeout(timeoutId: ReturnType<typeof setTimeout>): void {
    if (this.activeTimeouts.has(timeoutId)) {
      clearTimeout(timeoutId);
      this.activeTimeouts.delete(timeoutId);
    }
  }

  /**
   * Clear all pending timeouts
   * This should be called in ngOnDestroy to prevent memory leaks
   */
  clearAll(): void {
    this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.activeTimeouts.clear();
  }

  /**
   * Get the number of active (pending) timeouts
   * Useful for debugging and testing
   */
  get activeCount(): number {
    return this.activeTimeouts.size;
  }

  /**
   * Check if a specific timeout is still active
   * @param timeoutId - The timeout ID to check
   */
  isActive(timeoutId: ReturnType<typeof setTimeout>): boolean {
    return this.activeTimeouts.has(timeoutId);
  }
}

/**
 * Static helper functions for one-off timeout usage
 * Use the TimeoutManager class for more comprehensive timeout management
 */
export class TimeoutHelper {
  /**
   * Create a single tracked timeout with external cleanup responsibility
   * @param callback - Function to execute after delay
   * @param delay - Delay in milliseconds
   * @param trackingSet - Set to track the timeout for cleanup
   * @returns The timeout ID
   */
  static createTrackedTimeout(
    callback: () => void, 
    delay: number,
    trackingSet: Set<ReturnType<typeof setTimeout>>
  ): ReturnType<typeof setTimeout> {
    const timeoutId = setTimeout(() => {
      trackingSet.delete(timeoutId);
      callback();
    }, delay);
    
    trackingSet.add(timeoutId);
    return timeoutId;
  }

  /**
   * Clear all timeouts in a tracking set
   * @param trackingSet - Set containing timeout IDs to clear
   */
  static clearAllTimeouts(trackingSet: Set<ReturnType<typeof setTimeout>>): void {
    trackingSet.forEach(timeoutId => clearTimeout(timeoutId));
    trackingSet.clear();
  }
}
