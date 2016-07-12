namespace app {
  angular.module('app', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngAnimate'])
  .config((
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $locationProvider: ng.ILocationProvider
  ) => {

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  });
}
