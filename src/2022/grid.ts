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

export class Grid3D<T> {
  data = new Map<number, Map<number, Map<number, T>>>();

  set(x: number, y: number, z: number, value: T): void {
    let xValues = this.data.get(x);
    if (xValues === undefined) {
      xValues = new Map<number, Map<number, T>>();
      this.data.set(x, xValues);
    }

    let yValues = xValues.get(y);
    if (yValues === undefined) {
      yValues = new Map<number, T>();
      xValues.set(y, yValues);
    }

    yValues.set(z, value);
  }

  get(x: number, y: number, z: number, defaultValue?: T): T | undefined {
    const xValues = this.data.get(x);
    if (xValues !== undefined) {
      const yValues = xValues.get(y);
      if (yValues !== undefined) {
        const value = yValues.get(z);
        if (value !== undefined) {
          return value;
        }
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
