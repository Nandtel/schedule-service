angular
    .module('ScheduleModule')
    .factory('saveEnum', function() {
        return {
            DISABLED: 0,
            PLACE: 1,
            PERSONID: 2

        }
    });