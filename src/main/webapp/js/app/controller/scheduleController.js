angular
    .module('ScheduleModule')
    .controller('ScheduleController',
        function($mdDialog, $scope, $rootScope, weekService, scheduleHourService, orientationEnum, userService,
                 $q, $http, $location, $interval, $timeout, serverService, authorityEnum, tempTypeEnum) {
            var self = this;
            var sh, params;
            self.tempAddedScheduleHours = [];
            self.tempRemovedScheduleHours = [];
            self.users = {};
            self.scheduleHours = [];
            self.orientation = orientationEnum.DAYBYNAME;
            self.orientationEnum = orientationEnum;
            self.isPlanningDay = false;
            self.hasAction = false;
            self.tempErrors = [];

            params = $location.search();
            self.user = params.hasOwnProperty('user') ? {authority: 'USER', peopleId: params.user} : {authority: 'ADMIN'};
            self.currentWeek = params.hasOwnProperty('day') ? weekService.init(params.day) : weekService.init();

            self.isPlanningDay = weekService.isPlanningDay($rootScope.properties.planingDays);
            $interval(function() {
                self.isPlanningDay = weekService.isPlanningDay($rootScope.properties.planingDays);
             }, 1000 * 30);

            self.isAdmin = self.user.authority === authorityEnum.ADMIN;

            initialize();

            function initialize() {
                serverService.getUsersFromServer()
                    .then(function(answer) {
                        self.users = answer;
                    });

                serverService.getScheduleDataFromServerByCurrentWeek(self.currentWeek)
                    .then(function(answer) {
                        self.scheduleHours = answer;
                    });

                $scope.$watch('sch.hasAction', function() {
                    $timeout(function() {self.hasAction = false;}, 500);
                });

                $interval(function() {
                    if(self.hasAction)
                        serverService.getScheduleDataFromServerByCurrentWeek(self.currentWeek).then(function(answer) {
                            self.tempErrors = scheduleHourService.containsInTemp(answer, self.tempAddedScheduleHours);
                            sh = answer.concat(self.tempAddedScheduleHours);
                            sh = scheduleHourService.scheduleHoursWithoutTemp(sh, self.tempRemovedScheduleHours);
                            self.scheduleHours = sh;
                        });
                }, 1000);
            }

            self.setOrientation = function(orientation) {
                self.orientation = orientation;
            };
            self.nextWeek = function() {
                self.currentWeek = weekService.next(self.currentWeek);
                serverService.getScheduleDataFromServerByCurrentWeek(self.currentWeek)
                    .then(function(answer) {
                        self.scheduleHours = answer;
                    });
            };
            self.lastWeek = function() {
                self.currentWeek = weekService.previous(self.currentWeek);
                serverService.getScheduleDataFromServerByCurrentWeek(self.currentWeek)
                    .then(function(answer) {
                        self.scheduleHours = answer;
                    });
            };
            self.selectWorkplace = function(event, newScheduleHour, orientation, userIds, user) {
                $mdDialog.show({
                    targetEvent: event,
                    scope: $scope.$new(),
                    clickOutsideToClose: true,
                    controller: 'DialogController as dialog',
                    templateUrl: 'template/menu.html',
                    hasBackdrop: false,
                    disableParentScroll: false,
                    locals: {
                        newScheduleHour: newScheduleHour,
                        orientation: orientation,
                        userIds: userIds,
                        user: user
                    }
                })
            };
            self.selectOrientation = function($mdOpenMenu, event) {
                $mdOpenMenu(event);
            };
            self.sendToServerFromTemp = function() {
                if(self.tempAddedScheduleHours.length !== 0)
                    serverService.sendTempToServer(self.tempAddedScheduleHours, tempTypeEnum.ADDED).then(function() {
                        self.tempAddedScheduleHours = [];
                    });

                if(self.tempRemovedScheduleHours.length !== 0)
                    serverService.sendTempToServer(self.tempRemovedScheduleHours, tempTypeEnum.REMOVED).then(function() {
                        self.tempRemovedScheduleHours = [];
                    });
            };
        }
    );