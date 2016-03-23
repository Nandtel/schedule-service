angular
    .module('ScheduleModule')
    .factory('authorityEnum', function() {
        return {
            USER: 'USER',
            ADMIN: 'ADMIN'
        }
    });