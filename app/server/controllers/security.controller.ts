// src/controllers/security.controller.ts

import { NextResponse } from "next/server";
import { SecurityService } from "../services/security.service";

export class SecurityController {
  constructor(
    private readonly service: SecurityService = new SecurityService()
  ) {}

  async getSecurityDashboard() {
    try {
      const data = await this.service.getSecurityAnalytics();
      return NextResponse.json(
        {
          data,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to load security data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 500,
        }
      );
    }
  }
}
