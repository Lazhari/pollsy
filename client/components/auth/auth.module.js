'use strict';

angular.module('pollsyApp.auth', [
  'pollsyApp.constants',
  'pollsyApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
