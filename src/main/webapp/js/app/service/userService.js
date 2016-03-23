angular
    .module('ScheduleModule')
    .factory('userService', function() {
        return {
            transformUsersToUsersWithWorkHours: function(users) {
                var usersResult = {};
                angular.forEach(users, function(value, key) {
                    var name = value.split(' ');
                    usersResult[key] = ({name: name[0] + ' ' + name[1], hours: 0});
                });
                return usersResult;
            },
            resetWorkHours: function(users) {
                angular.forEach(users, function(user) {
                    user.hours = 0;
                });
                return users;
            },
            getArrayOfIds: function(users) {return Object.keys(users);}
        }
    });