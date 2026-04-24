import type { Slot } from '@/shared/api/types';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

/**
 * Generate a full day of time slots from 9:00 to 18:00
 * with the given interval (duration in minutes).
 * Merges with API-returned slots to set busy/free status.
 */
export const generateDaySlots = (
  date: string,
  durationMinutes: number,
  apiSlots: Slot[] = [],
): Slot[] => {
  const slots: Slot[] = [];
  const baseDate = new Date(`${date}T00:00:00`);

  const busySet = new Set(
    apiSlots
      .filter((s) => s.status === 'busy')
      .map((s) => s.startTime),
  );

  let currentMinutes = WORK_START_HOUR * 60;
  const endMinutes = WORK_END_HOUR * 60;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const startHour = Math.floor(currentMinutes / 60);
    const startMin = currentMinutes % 60;
    const endTotalMin = currentMinutes + durationMinutes;
    const endHour = Math.floor(endTotalMin / 60);
    const endMin = endTotalMin % 60;

    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setHours(endHour, endMin, 0, 0);

    const startIso = startTime.toISOString();

    const isBusy = busySet.has(startIso) || apiSlots.some(
      (s) => s.status === 'busy' && isSameSlotTime(s.startTime, startTime),
    );

    slots.push({
      startTime: startIso,
      endTime: endTime.toISOString(),
      status: isBusy ? 'busy' : 'free',
    });

    currentMinutes += durationMinutes;
  }

  return slots;
};

const isSameSlotTime = (isoString: string, date: Date): boolean => {
  const d = new Date(isoString);
  return d.getHours() === date.getHours() && d.getMinutes() === date.getMinutes();
};

/**
 * Count free slots in a generated day grid.
 */
export const countFreeSlots = (
  date: string,
  durationMinutes: number,
  apiSlots: Slot[] = [],
): number => {
  const slots = generateDaySlots(date, durationMinutes, apiSlots);
  return slots.filter((s) => s.status === 'free').length;
};

/**
 * Calculate total possible slots per day for a given duration.
 */
export const totalSlotsPerDay = (durationMinutes: number): number => {
  const totalMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60;
  return Math.floor(totalMinutes / durationMinutes);
};
