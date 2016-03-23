angular
    .module('ScheduleModule')
    .run(function($rootScope) {

        $rootScope.properties = {
            planingDays: ['Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
            minWeekHours: 40,
            sessionLength: 5,
            workplaces: [1, 2, 3, 4, 5, 6, 7, 8]
        };

        // $rootScope.server = {
        //     usersGET:       '/schedule_hour/api/users.php',
        //     scheduleGET:    '/schedule_hour/api/schedule.php',
        //     savePOST:       '/schedule_hour/api/schedule.php?action=save',
        //     removePOST:     '/schedule_hour/api/schedule.php?action=remove',
        //     saveTempPOST:   '/schedule_hour/api/schedule.php?action=saveall',
        //     removeTempPOST: '/schedule_hour/api/schedule.php?action=removeall'
        // };

    });