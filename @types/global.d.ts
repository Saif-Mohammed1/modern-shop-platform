// global.d.ts or types/global.d.ts
import {Connection} from 'mongoose';

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}
