import {NextResponse} from 'next/server';

import {DashboardService} from '../services/dashboard.service';

class AdminDashboardController {
  constructor(private readonly service: DashboardService = new DashboardService()) {}
  async getDashboardData() {
    const data = await this.service.getMainDashboard();
    return NextResponse.json(data);
  }
}
export default new AdminDashboardController();
