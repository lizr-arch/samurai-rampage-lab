export function attackIntervalMs(attackSpeed: number, weaponCooldownMs: number): number {
  const safeSpeed = Math.max(0.1, attackSpeed);
  return Math.max(100, Math.floor(weaponCooldownMs / safeSpeed));
}
