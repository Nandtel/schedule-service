angular
    .module('ScheduleModule')
    .factory('serverService', function($http, $q, weekService, userService, saveEnum, tempTypeEnum, $rootScope) {

        var server = {
            usersGET:       '/api/users',
            scheduleGET:    '/api/schedule',
            savePOST:       '/api/schedule/save',
            removePOST:     '/api/schedule/remove',
            saveTempPOST:   '/api/schedule/save/all',
            removeTempPOST: '/api/schedule/remove/all'
        };

        if(!!$rootScope.server)
            server = $rootScope.server;

        return {
            getScheduleDataFromServerByCurrentWeek: function(currentWeek) {
                var deferred = $q.defer();
                var requestData = weekService.requestData(currentWeek);
                $http.get(server.scheduleGET, {params: requestData}).then(function(response) {
                    deferred.resolve(response.data);
                });
                return deferred.promise;
            },
            getUsersFromServer: function() {
                var deferred = $q.defer();
                var users;
                $http.get(server.usersGET).then(function(response) {
                    users = userService.transformUsersToUsersWithWorkHours(response.data);
                    deferred.resolve(users);
                });
                return deferred.promise;
            },
            addScheduleHour: function(newScheduleHour, scheduleHours) {
                var deferred = $q.defer();
                $http.post(server.savePOST, newScheduleHour).then(function() {
                    scheduleHours.push(newScheduleHour);
                    deferred.resolve(scheduleHours);
                });
                return deferred.promise;
            },
            removeScheduleHour: function(targetScheduleHour, scheduleHours) {
                var index, deferred = $q.defer();
                $http.post(server.removePOST, targetScheduleHour).then(function() {
                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);
                    deferred.resolve(scheduleHours);
                });
                return deferred.promise;
            },
            replaceScheduleHour: function(targetScheduleHour, scheduleHours, saveState, data) {
                var index, deferred = $q.defer();
                $http.post(server.removePOST, targetScheduleHour).then(function() {
                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);

                    if (saveState === saveEnum.PLACE)       targetScheduleHour.place = data;
                    if (saveState === saveEnum.PERSONID)    targetScheduleHour.peopleId = data;

                    $http.post(server.savePOST, targetScheduleHour).then(function() {
                        targetScheduleHour = angular.copy(targetScheduleHour);
                        scheduleHours.push(targetScheduleHour);
                        deferred.resolve(scheduleHours);
                    });
                });
                return deferred.promise;
            },
            extendScheduleHour: function(targetScheduleHour, unionScheduleHour, scheduleHours) {
                var index, deferred = $q.defer();
                $http.post(server.removePOST, targetScheduleHour).then(function() {
                    index = scheduleHours.indexOf(targetScheduleHour);
                    scheduleHours.splice(index, 1);

                    $http.post(server.savePOST, unionScheduleHour).then(function() {
                        scheduleHours.push(unionScheduleHour);
                        deferred.resolve(scheduleHours);
                    });

                });
                return deferred.promise;
            },
            sendTempToServer: function(tempScheduleHours, tempType) {
                var request;
                if(tempType === tempTypeEnum.ADDED)     request = server.saveTempPOST;
                if(tempType === tempTypeEnum.REMOVED)   request = server.removeTempPOST;

                return $http.post(request, tempScheduleHours);
            }
        }
    });