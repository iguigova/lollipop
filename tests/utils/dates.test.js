import { jest } from '@jest/globals';
import {
  MILLISECONDS,
  isWithin,
  isWithinMinute,
  isWithinHour,
  isWithinDay,
  createWithin
} from '../../dist/utils/dates.js';

describe('dates utilities', () => {
    describe('MILLISECONDS constants', () => {
        it('should have correct millisecond values', () => {
            expect(MILLISECONDS.SECOND).toBe(1000);
            expect(MILLISECONDS.MINUTE).toBe(60 * 1000);
            expect(MILLISECONDS.HOUR).toBe(60 * 60 * 1000);
            expect(MILLISECONDS.DAY).toBe(24 * 60 * 60 * 1000);
        });
    });
    
    describe('isWithin', () => {
        it('should return true when dates are within interval', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:00:30Z');
            expect(isWithin(date1, date2, MILLISECONDS.MINUTE)).toBe(true);
        });
        
        it('should return false when dates are not within interval', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:02:00Z');
            expect(isWithin(date1, date2, MILLISECONDS.MINUTE)).toBe(false);
        });
        
        it('should handle string date inputs', () => {
            expect(isWithin(
                '2024-01-01T12:00:00Z',
                '2024-01-01T12:00:30Z',
                MILLISECONDS.MINUTE
            )).toBe(true);
        });
        
        it('should handle invalid interval inputs', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:00:01Z');
            expect(isWithin(date1, date2, null)).toBe(false);
            expect(isWithin(date1, date2, undefined)).toBe(false);
            expect(isWithin(date1, date2, 'invalid')).toBe(false);
        });
    });
    
    describe('isWithinMinute', () => {
        it('should return true for dates within one minute', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:00:59Z');
            expect(isWithinMinute(date1, date2)).toBe(true);
        });
        
        it('should return false for dates not within one minute', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:01:01Z');
            expect(isWithinMinute(date1, date2)).toBe(false);
        });
    });
    
    describe('isWithinHour', () => {
        it('should return true for dates within one hour', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T12:59:59Z');
            expect(isWithinHour(date1, date2)).toBe(true);
        });
        
        it('should return false for dates not within one hour', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-01T13:00:01Z');
            expect(isWithinHour(date1, date2)).toBe(false);
        });
    });
    
    describe('isWithinDay', () => {
        it('should return true for dates within one day', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-02T11:59:59Z');
            expect(isWithinDay(date1, date2)).toBe(true);
        });

        it('should return false for dates not within one day', () => {
            const date1 = new Date('2024-01-01T12:00:00Z');
            const date2 = new Date('2024-01-02T12:00:01Z');
            expect(isWithinDay(date1, date2)).toBe(false);
        });
    });

    describe('createWithin', () => {
        beforeEach(() => {
            // Mock Date.now() to return a fixed timestamp
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
        });
        
        afterEach(() => {
            jest.useRealTimers();
        });
        
        it('creates date within seconds from now', () => {
            const result = createWithin(MILLISECONDS.SECOND, 30);
            const expected = new Date('2024-01-01T12:00:30Z');
            expect(result).toEqual(expected);
        });

        it('creates date within minutes from now', () => {
            const result = createWithin(MILLISECONDS.MINUTE, 5);
            const expected = new Date('2024-01-01T12:05:00Z');
            expect(result).toEqual(expected);
        });
        
        it('creates date within hours from now', () => {
            const result = createWithin(MILLISECONDS.HOUR, 2);
            const expected = new Date('2024-01-01T14:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('creates date within days from now', () => {
            const result = createWithin(MILLISECONDS.DAY, 3);
            const expected = new Date('2024-01-04T12:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles negative offset', () => {
            const result = createWithin(MILLISECONDS.HOUR, -2);
            const expected = new Date('2024-01-01T10:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles zero offset', () => {
            const result = createWithin(MILLISECONDS.MINUTE, 0);
            const expected = new Date('2024-01-01T12:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles custom base date', () => {
            const baseDate = new Date('2023-12-25T00:00:00Z');
            const result = createWithin(MILLISECONDS.DAY, 2, baseDate);
            const expected = new Date('2023-12-27T00:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles string date input', () => {
            const baseDate = '2023-12-25T00:00:00Z';
            const result = createWithin(MILLISECONDS.DAY, 2, baseDate);
            const expected = new Date('2023-12-27T00:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles invalid interval by treating it as 0', () => {
            const result = createWithin(null, 5);
            const expected = new Date('2024-01-01T12:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles invalid offset by treating it as 0', () => {
            const result = createWithin(MILLISECONDS.HOUR, 'invalid');
            const expected = new Date('2024-01-01T12:00:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles decimal offsets', () => {
            const result = createWithin(MILLISECONDS.HOUR, 1.5);
            const expected = new Date('2024-01-01T13:30:00Z');
            expect(result).toEqual(expected);
        });
        
        it('handles very large offsets', () => {
            const result = createWithin(MILLISECONDS.DAY, 365);
            const expected = new Date('2024-12-31T12:00:00Z');
            expect(result).toEqual(expected);
        });
    });
});

