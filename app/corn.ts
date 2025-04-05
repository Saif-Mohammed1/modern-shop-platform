import type {BulkWriteResult} from 'mongodb';
import cron from 'node-cron';

import Product from './server/models/Product.model';

cron.schedule('*/5 * * * *', () => {
  const BATCH_SIZE = 1000;
  let processed = 0;

  void (async () => {
    try {
      do {
        const result: BulkWriteResult = await Product.bulkWrite(
          [
            // Release expired reservations
            {
              updateMany: {
                filter: {
                  lastReserved: {$lt: new Date(Date.now() - 15 * 60 * 1000)},
                },
                update: {
                  $inc: {stock: '$reserved', reserved: -'$reserved'},
                  $unset: {lastReserved: ''},
                },
              },
            },
            // Expire old discounts
            {
              updateMany: {
                filter: {discountExpire: {$lt: new Date()}},
                update: {
                  $set: {discount: 0},
                  $unset: {discountExpire: ''},
                },
              },
            },
          ],
          {ordered: false},
        );

        processed = result.modifiedCount || 0;
      } while (processed === BATCH_SIZE);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  })();
});
