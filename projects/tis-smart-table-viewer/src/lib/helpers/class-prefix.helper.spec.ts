import { ClassPrefixHelper } from './class-prefix.helper';

describe('ClassPrefixHelper', () => {
  it('builds a prefixed class name', () => {
    expect(ClassPrefixHelper.cx('tis-', 'table')).toBe('tis-table');
    expect(ClassPrefixHelper.cx('app-', 'page')).toBe('app-page');
  });

  it('joins multiple names and skips falsy', () => {
    expect(ClassPrefixHelper.cxMany('tis-', 'table', false, 'table-bordered', null)).toBe(
      'tis-table tis-table-bordered'
    );
  });

  it('falls back to default prefix when empty', () => {
    expect(ClassPrefixHelper.cx('', 'a')).toBe('tis-a');
  });
});
