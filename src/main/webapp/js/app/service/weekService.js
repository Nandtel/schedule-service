angular
    .module('ScheduleModule')
    .factory('weekService', function(moment) {
        return {
            init: function(initDate) {
                var isExistInitDate = !!initDate;
                var startOfWeek = (isExistInitDate ? moment(initDate, 'YYYY-MM-DD') : moment().add(1, 'weeks')).startOf('week');
                var endOfWeek = (isExistInitDate ? moment(initDate, 'YYYY-MM-DD') : moment().add(1, 'weeks')).endOf('week');
                var currentWeek = startOfWeek.twix(endOfWeek);
                var currentWeekAdditional = startOfWeek.subtract(1, 'days').twix(endOfWeek.add(1, 'days'));
                return {currentWeekNormal: currentWeek, currentWeekAdditional: currentWeekAdditional};
            },
            next: function(week) {
                var startOfWeek = week.currentWeekNormal.start().add(1, 'weeks');
                var endOfWeek = week.currentWeekNormal.end().add(1, 'weeks');
                var currentWeek = startOfWeek.twix(endOfWeek);
                var currentWeekAdditional = startOfWeek.subtract(1, 'days').twix(endOfWeek.add(1, 'days'));
                return {currentWeekNormal: currentWeek, currentWeekAdditional: currentWeekAdditional};
            },
            previous: function(week) {
                var startOfWeek = week.currentWeekNormal.start().subtract(1, 'weeks');
                var endOfWeek = week.currentWeekNormal.end().subtract(1, 'weeks');
                var currentWeek = startOfWeek.twix(endOfWeek);
                var currentWeekAdditional = startOfWeek.subtract(1, 'days').twix(endOfWeek.add(1, 'days'));
                return {currentWeekNormal: currentWeek, currentWeekAdditional: currentWeekAdditional};
            },
            requestData: function(week) {
                var from = week.currentWeekAdditional.start().format('YYYY-MM-DD HH:mm:ss');
                var to = week.currentWeekAdditional.end().format('YYYY-MM-DD HH:mm:ss');
                return {"from": from, "to": to};
            },
            getArrayOfDates: function(week) {
                var dates = [];
                var iterator = week.currentWeekAdditional.iterate("days");
                while(iterator.hasNext()) {
                    dates.push(iterator.next().format('YYYY-MM-DD'));
                }
                return dates;
            },
            isPlanningDay: function(planingDays) {
                var currentDay, isPlanningDay = true;
                currentDay = moment().format('dddd');
                angular.forEach(planingDays, function(day) {
                    if(day === currentDay)
                        isPlanningDay = true;
                });
                return isPlanningDay;
            }
        }
    });