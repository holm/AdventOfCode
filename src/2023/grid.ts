import { range } from "lodash";

export class Range {
  min?: number;
  max?: number;

  update(value: number): void {
    if (this.min === undefined || this.min > value) {
      this.min = value;
    }
    if (this.max === undefined || this.max < value) {
      this.max = value;
    }
  }

  asArray(): number[] | undefined {
    if (this.min === undefined || this.max === undefined) {
      return;
    }

    return range(this.min, this.max + 1);
  }
}

export class Column<T> {
  values = new Map<number, T>();
  range = new Range();

  get(y: number): T | undefined {
    return this.values.get(y);
  }

  set(y: number, value: T): void {
    this.values.set(y, value);

    this.range.update(y);
  }

  has(y: number): boolean {
    return this.values.has(y);
  }
}

export class Grid<T> {
  yValues = new Map<number, Column<T>>();
  xRange = new Range();
  xRanges = new Map<number, Range>();
  yRange = new Range();

  set(x: number, y: number, value: T): void {
    let yValuesForX = this.yValues.get(x);
    if (yValuesForX === undefined) {
      yValuesForX = new Column<T>();
      this.yValues.set(x, yValuesForX);

      this.xRange.update(x);
    }
    yValuesForX.set(y, value);

    this.yRange.update(y);

    let xRangeForY = this.xRanges.get(y);
    if (xRangeForY === undefined) {
      xRangeForY = new Range();
      this.xRanges.set(y, xRangeForY);
    }
    xRangeForY.update(x);
  }

  get(x: number, y: number, defaultValue?: T): T | undefined {
    const yValuesForX = this.yValues.get(x);
    if (yValuesForX !== undefined) {
      const value = yValuesForX.get(y);
      if (value !== undefined) {
        return value;
      }
    }

    return defaultValue;
  }

  has(x: number, y: number): boolean {
    const yValuesForX = this.yValues.get(x);
    if (yValuesForX === undefined) {
      return false;
    }
    return yValuesForX.has(y);
  }

  getYRange(x?: number): Range {
    if (x !== undefined) {
      const column = this.yValues.get(x);

      return column?.range || new Range();
    } else {
      return this.yRange;
    }
  }

  getXRange(y?: number): Range {
    if (y !== undefined) {
      return this.xRanges.get(y) || new Range();
    } else {
      return this.xRange;
    }
  }

  toString(): string {
    const yArray = this.getYRange().asArray();
    if (yArray === undefined) {
      return "<empty>";
    }

    const lines = yArray.map((y) => {
      const xArray = this.getXRange(y).asArray();
      if (xArray === undefined) {
        return "";
      }

      return xArray.map((x) => this.get(x, y)).join("");
    });

    return lines.join("\n");
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
