import { Injectable } from '@nestjs/common';
import { Counter, register } from 'prom-client';

@Injectable()
export class MetricsService {
  authRequestsCounter: Counter<string>;
  loginFailuresCounter: Counter<string>;
  refreshFailuresCounter: Counter<string>;
  logoutCounter: Counter<string>;
  userRequestsCounter: Counter<string>;
  userCreationCounter: Counter<string>;
  userFindByIdCounter: Counter<string>;

  constructor() {
    this.authRequestsCounter = this.getOrCreateCounter(
      'auth_requests_total',
      'Total number of authentication requests',
    );

    this.loginFailuresCounter = this.getOrCreateCounter(
      'auth_login_failures_total',
      'Total number of failed login attempts',
    );

    this.refreshFailuresCounter = this.getOrCreateCounter(
      'auth_refresh_failures_total',
      'Total number of failed refresh token attempts',
    );

    this.logoutCounter = this.getOrCreateCounter(
      'auth_logout_total',
      'Total number of logout attempts',
    );

    this.userRequestsCounter = this.getOrCreateCounter(
      'user_requests_total',
      'Total number of requests related to users',
    );

    this.userCreationCounter = this.getOrCreateCounter(
      'user_creation_total',
      'Total number of user creation attempts',
    );

    this.userFindByIdCounter = this.getOrCreateCounter(
      'user_find_by_id_total',
      'Total number of requests to find users by ID',
    );
  }

  private getOrCreateCounter(name: string, help: string): Counter<string> {
    const existingMetric = register.getSingleMetric(name);
    if (existingMetric) {
      return existingMetric as Counter<string>;
    }
    return new Counter({ name, help });
  }

  // Métodos para incrementar contadores de autenticación
  incrementAuthRequests() {
    this.authRequestsCounter.inc();
  }

  incrementLoginFailures() {
    this.loginFailuresCounter.inc();
  }

  incrementRefreshFailures() {
    this.refreshFailuresCounter.inc();
  }

  incrementLogout() {
    this.logoutCounter.inc();
  }

  // Métodos para incrementar contadores de usuario
  incrementUserRequests() {
    this.userRequestsCounter.inc();
  }

  incrementUserCreation() {
    this.userCreationCounter.inc();
  }

  incrementUserFindById() {
    this.userFindByIdCounter.inc();
  }
}
