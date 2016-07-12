angular
    .module('ScheduleModule')
    .controller('DialogController',
        function($scope, $rootScope, $mdDialog, scheduleHourService, orientation, users, user, newScheduleHour,
                 saveEnum, serverService, authorityEnum, userService) {
            var self = this;

            var workplaces = $rootScope.properties.workplaces;
            var tempAddedScheduleHours = $scope.sch.tempAddedScheduleHours;
            var tempRemovedScheduleHours = $scope.sch.tempRemovedScheduleHours;
            var index, existsInTemp, scheduleHours;

            var ordered = userService.getArrayOfIdsOrderedBy(users, 'name');
            var nonordered = userService.getArrayOfIds(users);

            serverService.getScheduleDataFromServerByCurrentWeek($scope.sch.currentWeek).then(function(answer) {
                scheduleHours = answer.concat($scope.sch.tempAddedScheduleHours);
                scheduleHours = scheduleHourService.scheduleHoursWithoutTemp(scheduleHours, $scope.sch.tempRemovedScheduleHours);
                self.prefs = scheduleHourService
                    .checkScheduleForOpenMenu(newScheduleHour, scheduleHours, tempAddedScheduleHours, orientation, users, workplaces);
            });

            self.isAdmin = user.authority === authorityEnum.ADMIN;
            self.saveEnum = saveEnum;

            self.save = function(saveState, data) {
                if (saveState === saveEnum.PLACE)       newScheduleHour.place = data;
                if (saveState === saveEnum.PERSONID)    newScheduleHour.peopleId = nonordered[ordered.indexOf(data)];
                if (saveState === saveEnum.DISABLED)    newScheduleHour.peopleId = 0;

                if(!self.isAdmin) {
                    tempAddedScheduleHours.push(newScheduleHour);
                    scheduleHours.push(newScheduleHour);
                    $scope.sch.scheduleHours = scheduleHours;
                }

                if(self.isAdmin)
                    serverService.addScheduleHour(newScheduleHour, scheduleHours).then(function(answer) {
                        $scope.sch.scheduleHours = answer;
                    });

                $mdDialog.hide();
            };
            self.replace = function(targetScheduleHour, data, saveState) {
                if(!self.isAdmin) {
                    index = tempAddedScheduleHours.indexOf(targetScheduleHour);
                    existsInTemp = index !== -1;

                    if(existsInTemp)
                        tempAddedScheduleHours.splice(index, 1);
                    else
                        tempRemovedScheduleHours.push(newScheduleHour);

                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);

                    targetScheduleHour = angular.copy(targetScheduleHour);

                    if (saveState === saveEnum.PLACE)       targetScheduleHour.place = data;
                    if (saveState === saveEnum.PERSONID)    targetScheduleHour.peopleId = nonordered[ordered.indexOf(data)];

                    tempAddedScheduleHours.push(targetScheduleHour);
                    scheduleHours.push(targetScheduleHour);
                    $scope.sch.scheduleHours = scheduleHours;
                }

                if(self.isAdmin)
                    serverService.replaceScheduleHour(targetScheduleHour, scheduleHours, saveState, data).then(function(answer) {
                        $scope.sch.scheduleHours = answer;
                    });

                $mdDialog.hide();
            };
            self.remove = function(targetScheduleHour) {

                if(!self.isAdmin) {
                    index = tempAddedScheduleHours.indexOf(targetScheduleHour);
                    existsInTemp = index !== -1;

                    if(existsInTemp)
                        tempAddedScheduleHours.splice(index, 1);
                    else
                        tempRemovedScheduleHours.push(targetScheduleHour);

                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);
                    $scope.sch.scheduleHours = scheduleHours;
                }

                if(self.isAdmin)
                    serverService.removeScheduleHour(targetScheduleHour, scheduleHours).then(function(answer) {
                        $scope.sch.scheduleHours = answer;
                    });

                $mdDialog.hide();
            };
            self.extend = function(targetScheduleHour) {
                var activeRange = moment.duration(5, 'hours')
                    .afterMoment(moment(newScheduleHour.dateHourStart).minute(0).second(0));
                var shRange = moment.duration(targetScheduleHour.hours, 'hours')
                    .afterMoment(moment(targetScheduleHour.dateHourStart).minute(0).second(0));
                var unionRange = activeRange.union(shRange);

                var unionScheduleHour = {
                    dateHourStart: unionRange.start().format('YYYY-MM-DD HH:mm:ss'),
                    hours: unionRange.length("hours"),
                    peopleId: targetScheduleHour.peopleId,
                    place: targetScheduleHour.place
                };

                if(!self.isAdmin) {
                    index = tempAddedScheduleHours.indexOf(targetScheduleHour);
                    existsInTemp = index !== -1;

                    if(existsInTemp)
                        tempAddedScheduleHours.splice(index, 1);
                    else
                        tempRemovedScheduleHours.push(targetScheduleHour);

                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);

                    tempAddedScheduleHours.push(unionScheduleHour);
                    scheduleHours.push(unionScheduleHour);

                    $scope.sch.scheduleHours = scheduleHours;
                }

                if(self.isAdmin)
                    serverService.extendScheduleHour(targetScheduleHour, unionScheduleHour, scheduleHours).then(function(answer) {
                        $scope.sch.scheduleHours = answer;
                    });

                $mdDialog.hide();
            };
            self.hide = function() {
                $mdDialog.hide();
            };
        }
    );