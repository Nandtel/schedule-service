angular
    .module('ScheduleModule')
    .factory('tempTypeEnum', function() {
        return {
            ADDED: 0,
            REMOVED: 1
        }
    });