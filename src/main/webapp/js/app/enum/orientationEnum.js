angular
    .module('ScheduleModule')
    .factory('orientationEnum', function() {
        return {
            DAYBYNAME: 0,
            NAMEBYDAY: 1,
            PLACEBYDAY: 2
        }
    });