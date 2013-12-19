'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngTable',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/showCharges', {
      templateUrl: 'chargeList.html',
      controller: 'ChargeListCtrl'
    }).
    when('/addCharge', {
      templateUrl: 'addCharge.html',
      controller: 'AddChargeCtrl'
    }).
    when('/accounts', {
          templateUrl: 'accounts.html',
          controller: 'AccountsCtl'
    }).
    when('/periods', {
        templateUrl: 'periods.html',
        controller: 'PeriodsCtl'
  }).
    when('/planning', {
        templateUrl: 'planning.html',
        controller: 'PlanningCtl'
  }).
    otherwise({
      redirectTo: '/addCharge'
    });

  $locationProvider.html5Mode(true);
});
