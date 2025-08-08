import { ClassConstructor, plainToInstance } from 'class-transformer';

export class ListResponse<T> {
  constructor(rows: T[], count: number, type?: ClassConstructor<T>) {
    this.rows = type ? plainToInstance(type, rows) : rows;
    this.count = count;
  }
  rows: T[];
  count: number;
}
