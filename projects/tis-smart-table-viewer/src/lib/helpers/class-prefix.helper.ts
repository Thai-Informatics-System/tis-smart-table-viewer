/**
 * Builds design-system CSS class names from a configurable prefix (default: tis-).
 */
export class ClassPrefixHelper {
  static readonly DEFAULT_PREFIX = 'tis-';

  static cx(prefix: string, name: string): string {
    return `${prefix || ClassPrefixHelper.DEFAULT_PREFIX}${name}`;
  }

  /** Join multiple suffixes; falsy names are skipped. */
  static cxMany(prefix: string, ...names: (string | null | undefined | false)[]): string {
    return names
      .filter((n): n is string => typeof n === 'string' && n.length > 0)
      .map((n) => ClassPrefixHelper.cx(prefix, n))
      .join(' ');
  }
}
