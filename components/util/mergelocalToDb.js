import { mergeLocalCartWithDB } from "../context/cartAction";

class MergeLocalCartWithDBOOP {
  constructor() {
    this.localCart = [];
    this.isCartMerged = false;
  }

  async mergeCartWithDB(user) {
    if (!this.isCartMerged && user) {
      try {
        await mergeLocalCartWithDB();
        this.isCartMerged = true; // Mark the cart as merged
      } catch (error) {
        throw new Error(error);
      }
    }
  }
}
export default MergeLocalCartWithDBOOP;
