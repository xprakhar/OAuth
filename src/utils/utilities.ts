export function parseDuration(duration: string): number {
  const regex = /(\d+)([smhd])/g;
  let totalMilliseconds = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(duration)) !== null) {
    const value = Number(match[1]) || 0;
    const unit = match[2];

    switch (unit) {
      case 's': // seconds
        totalMilliseconds += value * 1000;
        break;
      case 'm': // minutes
        totalMilliseconds += value * 60 * 1000;
        break;
      case 'h': // hours
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case 'd': // days
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  if (totalMilliseconds === 0) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  return totalMilliseconds;
}
