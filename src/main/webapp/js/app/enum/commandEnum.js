angular
    .module('ScheduleModule')
    .factory('command', function() {
        return {
            ADD: 0,
            CLEAR: 1
        }
    });