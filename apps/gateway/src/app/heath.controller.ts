// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common'
import { DiskHealthIndicator, HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus'
import { Public } from '@maple/shared'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 힙 메모리가 150MB를 넘으면 unhealthy
      () => this.memory.checkRSS('memory_rss', 250 * 1024 * 1024), // RSS 메모리가 250MB를 넘으면 unhealthy
    ])
  }
}
