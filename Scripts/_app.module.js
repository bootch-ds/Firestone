var app = angular.module('FS_Data', ['ngRoute']);


app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('', { templateUrl: "/WebParts/Home.html", controller: '' })
        .when('/', { templateUrl: "/WebParts/Home.html", controller: '', useAsDefault: true })
        .when('/home', { templateUrl: "/WebParts/Home.html", controller: '' })
        .when('/mystats', { templateUrl: "/WebParts/Members/Details.html", controller: '' })
        .when('/roster', { templateUrl: "/WebParts/Roster/Roster.html" })
        .when('/member', { templateUrl: "/WebParts/Members/Details.html" })
        .when('/member/:MemberID', { templateUrl: "/WebParts/Members/Details.html" })
        .when('/about', { templateUrl: "/WebParts/About.html", controller: '' })
        .when('/settings', { templateUrl: "/WebParts/Settings.html" })
        .otherwise({ template: "ERROR: MISSING TEMPLATE" });

    // use the HTML5 History API
    //$locationProvider.html5Mode(false);
    //$locationProvider.hasPrefix("#!");
});