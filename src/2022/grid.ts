export class Grid<T> {
  data = new Map<number, Map<number, T>>();

  set(x: number, y: number, value: T): void {
    let column = this.data.get(x);
    if (column === undefined) {
      column = new Map<number, T>();
      this.data.set(x, column);
    }

    column.set(y, value);
  }

  get(x: number, y: number, defaultValue?: T): T | undefined {
    const column = this.data.get(x);
    if (column !== undefined) {
      const value = column.get(y);
      if (value !== undefined) {
        return value;
      }
    }

    return defaultValue;
  }

  private xs(): Iterable<number> {
    return this.data.keys();
  }

  get xMin(): number {
    return Math.min(...this.xs());
  }

  get xMax(): number {
    return Math.max(...this.xs());
  }

  private *ys(): Iterable<number> {
    for (const column of this.data.values()) {
      for (const y of column.keys()) {
        yield y;
      }
    }
  }

  get yMin(): number {
    return Math.min(...this.ys());
  }

  get yMax(): number {
    return Math.max(...this.ys());
  }
}
