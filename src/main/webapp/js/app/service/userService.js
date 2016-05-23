angular
    .module('ScheduleModule')
    .factory('userService', function(lodash) {
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
            getArrayOfIds: function(users) {return Object.keys(users);},
            getArrayOfIdsOrderedBy: function (users, orderBy) {
                return lodash.chain(users)
                    .map(function (value, key) {
                        return {id: key, name: value.name, hours: value.hours};
                    })
                    .sortBy(orderBy)
                    .map(function (user) {
                        return user.id;
                    })
                    .value();
            }
        }
    });