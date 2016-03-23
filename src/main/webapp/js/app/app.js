angular
    .module('ScheduleModule', ['ngMaterial', 'angularMoment', 'ngLodash'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('accept')
            .dark()
            .primaryPalette('green', {'default': '800'})
            .accentPalette('orange')
            .accentPalette('pink');

        $mdThemingProvider.theme('default')
            .primaryPalette('grey', {'default': '800'})
            .accentPalette('red', {'default': '700'})
            .warnPalette('red', {'default': '800'});
    })
    .run(function(moment, amMoment, $rootScope) {
        moment.locale('ru');
        amMoment.changeLocale('ru');

        $rootScope.scheduleTime = [
            '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00',
            '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
            '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00'];
        $rootScope.scheduleRepository = [
            //{dateHourStart: moment().format('YYYY-MM-DD HH:mm:ss'), hours: 5, peopleId: 441, place: 1},
            //{dateHourStart: moment().format('YYYY-MM-DD HH:mm:ss'), hours: 5, peopleId: 332, place: 2},
            //{dateHourStart: moment().format('YYYY-MM-DD HH:mm:ss'), hours: 5, peopleId: 531, place: 3}
        ];

    });