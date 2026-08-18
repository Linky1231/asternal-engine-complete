export type ActivitySnapshot = {
  totalSeconds: number;
  gameCount: number;
  likeCount: number;
};

/** Determina si el historial debe ayudar a comenzar, en vez de mostrar métricas vacías. */
export function isFirstActivity({ totalSeconds, gameCount, likeCount }: ActivitySnapshot) {
  return totalSeconds <= 0 && gameCount === 0 && likeCount === 0;
}
