'use strict';

angular.module('pollzyApp.auth', [
  'pollzyApp.constants',
  'pollzyApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
