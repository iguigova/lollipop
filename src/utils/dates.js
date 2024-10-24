export const MILLISECONDS = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
};

const getNumOrDefault = (val) => (typeof val !== 'number') ? 0 : val;

export const isWithin = (date1, date2, interval) => {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    const diff = Math.abs(d1.getTime() - d2.getTime());
    
    return diff <= getNumOrDefault(interval);
};

export const isWithinMinute = (date1, date2) => isWithin(date1, date2, MILLISECONDS.MINUTE);
export const isWithinHour = (date1, date2) => isWithin(date1, date2, MILLISECONDS.HOUR);
export const isWithinDay = (date1, date2) => isWithin(date1, date2, MILLISECONDS.DAY);

export const createWithin = (date, offset, interal) => {
    const baseDate = date instanceof Date ? date : new Date(date); 
    return new Date(baseDate.getTime() + (geNumOrDefault(offset) * getNumOrDefault(interval)));
};
