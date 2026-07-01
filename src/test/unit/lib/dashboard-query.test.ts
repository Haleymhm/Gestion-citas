import {
  DashboardQuerySchema,
  DashboardRangeSchema,
  validateQuery,
} from '@/lib/validations';

describe('Dashboard validations', () => {
  describe('DashboardRangeSchema', () => {
    it('accepts month', () => {
      expect(DashboardRangeSchema.parse('month')).toBe('month');
    });

    it('accepts prev, quarter, year', () => {
      expect(DashboardRangeSchema.parse('prev')).toBe('prev');
      expect(DashboardRangeSchema.parse('quarter')).toBe('quarter');
      expect(DashboardRangeSchema.parse('year')).toBe('year');
    });

    it('rejects invalid values', () => {
      expect(() => DashboardRangeSchema.parse('decade')).toThrow();
      expect(() => DashboardRangeSchema.parse('')).toThrow();
      expect(() => DashboardRangeSchema.parse(42)).toThrow();
    });
  });

  describe('DashboardQuerySchema', () => {
    it('defaults to month when range is omitted', () => {
      expect(DashboardQuerySchema.parse({}).range).toBe('month');
    });

    it('uses provided range', () => {
      expect(DashboardQuerySchema.parse({ range: 'prev' }).range).toBe('prev');
    });

    it('rejects unknown range', () => {
      expect(() => DashboardQuerySchema.parse({ range: 'foo' })).toThrow();
    });
  });

  describe('validateQuery', () => {
    it('returns success for valid params', () => {
      const params = new URLSearchParams('range=quarter');
      const r = validateQuery(DashboardQuerySchema, params);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.range).toBe('quarter');
      }
    });

    it('returns error when value is invalid', () => {
      const params = new URLSearchParams('range=lifetime');
      const r = validateQuery(DashboardQuerySchema, params);
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error).toContain('range');
      }
    });

    it('returns parsed data with default when missing', () => {
      const params = new URLSearchParams();
      const r = validateQuery(DashboardQuerySchema, params);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.range).toBe('month');
      }
    });

    it('ignores unknown keys gracefully', () => {
      const params = new URLSearchParams('range=year&extra=foo');
      const r = validateQuery(DashboardQuerySchema, params);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.range).toBe('year');
      }
    });
  });
});
