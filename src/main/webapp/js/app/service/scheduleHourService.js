angular
    .module('ScheduleModule')
    .factory('scheduleHourService', function(moment, $http, orientationEnum) {

        function getRange(dateHourStart, sessionDurationHours) {
            var activeSessionDuration = moment.duration(sessionDurationHours, 'hours');
            return activeSessionDuration.afterMoment(moment(dateHourStart).minute(0).second(0));
        }

        function deleteElementFromArray(place, workPlaces) {
            var index = workPlaces.indexOf(place);
            if(index !== -1)
                workPlaces.splice(index, 1);
        }

        function getCleanWorkTimeLine(weekDates) {
            var hours = 24;
            var workTimeLine = angular.copy(weekDates);
            var i, j;

            for(i = 0; i < workTimeLine.length; i++) {
                workTimeLine[i] = new Array(hours);
                for(j = 0; j < hours; j++) {
                    workTimeLine[i][j] = 0;
                }
            }
            return workTimeLine;
        }

        function indexOf(tesh, scheduleHours) {
            var index = -1, i, length;
            for(i = 0, length = scheduleHours.length; i < length; i++) {

                if(equalsScheduleHours(scheduleHours[i], tesh)) {
                    index = i;
                    break;
                }

            }
            return index;
        }

        function equalsScheduleHours(sh1, sh2) {
            var equalDateHourStart, equalHours, equalPeopleId, equalPlace, equal = false;

            if(typeof sh1 !== "undefined" && typeof sh2 !== "undefined") {
                equalDateHourStart = sh1.dateHourStart === sh2.dateHourStart;
                equalHours = sh1.hours === sh2.hours;
                equalPeopleId = sh1.peopleId == sh2.peopleId;
                equalPlace = sh1.place === sh2.place;

                if(equalDateHourStart && equalHours && equalPeopleId && equalPlace)
                    equal = true;
            }

            return equal;
        }

        return {
            equals: equalsScheduleHours,
            checkScheduleForOpenMenu: function(newScheduleHour, unionScheduleHours, tempAddedScheduleHours, orientation, userIds, workplaces) {

                var shRange, isOverlaps, isSamePerson, isEqualsOrEngulfs, targetRange,
                    isSamePlace, activeRange, workPlaces, workPlacesForReplacement, activeRangeAddit,
                    canBeDeletedOrReplaced, canBeExtended, nothingCanDo, isBlockedAllWorkplaces, targetScheduleHour,
                    targetScheduleHourArray, overlapsForBlocked, isPlaceByDay, peopleIds, peopleIdsForReplacement,
                    canBeBlocked, targetScheduleHourArrayAddit, isOverlapsAddit, intersectWithTemp;

                activeRangeAddit = getRange(moment(newScheduleHour.dateHourStart).subtract(1, 'hours'), newScheduleHour.hours + 1 + 1);
                activeRange = getRange(newScheduleHour.dateHourStart, newScheduleHour.hours);
                workPlaces = angular.copy(workplaces);
                workPlacesForReplacement = angular.copy(workplaces);
                peopleIds = angular.copy(userIds);
                peopleIdsForReplacement = angular.copy(userIds);

                canBeDeletedOrReplaced = false;
                canBeExtended = false;
                nothingCanDo = false;
                isBlockedAllWorkplaces = false;
                canBeBlocked = true;
                intersectWithTemp = false;

                targetScheduleHour = {};
                targetScheduleHourArray = [];
                targetScheduleHourArrayAddit = [];
                overlapsForBlocked = [];

                isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;

                // newScheduleHour and unionScheduleHours
                angular.forEach(unionScheduleHours, function(sh) {
                    shRange = getRange(sh.dateHourStart, sh.hours);

                    isOverlaps = activeRange.overlaps(shRange);
                    isOverlapsAddit = activeRangeAddit.overlaps(shRange);
                    isSamePerson = sh.peopleId == newScheduleHour.peopleId;
                    isSamePlace = sh.place == newScheduleHour.place;
                    isBlockedAllWorkplaces = sh.place === 0 && sh.peopleId === 0;
                    isEqualsOrEngulfs = activeRange.equals(shRange) || activeRange.engulfs(shRange) || shRange.engulfs(activeRange);

                    if((isSamePerson || isSamePlace) && isOverlapsAddit && !isEqualsOrEngulfs)
                        canBeExtended = true;

                    if((isSamePerson || isSamePlace || isBlockedAllWorkplaces) && isOverlaps)
                        targetScheduleHourArray.push(sh);

                    if((isSamePerson || isSamePlace || isBlockedAllWorkplaces) && isOverlapsAddit)
                        targetScheduleHourArrayAddit.push(sh);

                    if(isOverlaps)
                        overlapsForBlocked.push(sh);

                    if(!isPlaceByDay && isOverlaps && !isSamePerson && sh.place != 0)
                        deleteElementFromArray(sh.place, workPlaces);

                    if(isPlaceByDay && isOverlaps && !isSamePlace && sh.peopleId != 0)
                        deleteElementFromArray(sh.peopleId.toString(), peopleIds);
                });

                if(targetScheduleHourArray.length >= 2)
                    angular.forEach(targetScheduleHourArray, function(tsh) {
                        if(tempAddedScheduleHours.indexOf(tsh) !== -1) {
                            intersectWithTemp = true;
                            targetScheduleHourArray = [tsh];
                        }

                    });

                if(targetScheduleHourArray.length >= 2 ||
                    targetScheduleHourArray.length === 0 && (workPlaces.length === 0 || peopleIds.length === 0))
                    nothingCanDo = true;

                if(targetScheduleHourArray.length === 1 || targetScheduleHourArrayAddit.length === 1) {

                    if(targetScheduleHourArrayAddit.length === 1) {
                        targetScheduleHour = targetScheduleHourArrayAddit[0];
                    }

                    if(targetScheduleHourArray.length === 1) {
                        targetScheduleHour = targetScheduleHourArray[0];
                        canBeDeletedOrReplaced = true;
                    }

                    if(targetScheduleHourArrayAddit.length === 2) {
                        canBeExtended = false;

                        angular.forEach(targetScheduleHourArrayAddit, function(tshaa) {
                            if(tshaa.place === 0)
                                canBeExtended = true;
                        });
                    }

                    // targetScheduleHour and unionScheduleHours
                    angular.forEach(unionScheduleHours, function(sh) {
                        shRange = getRange(sh.dateHourStart, sh.hours);
                        targetRange = getRange(targetScheduleHour.dateHourStart, targetScheduleHour.hours);
                        isOverlaps = targetRange.overlaps(shRange);

                        if(!isPlaceByDay && isOverlaps && sh.place != 0)
                            deleteElementFromArray(sh.place, workPlacesForReplacement);

                        if(isPlaceByDay && isOverlaps && sh.peopleId != 0)
                            deleteElementFromArray(sh.peopleId.toString(), peopleIdsForReplacement);
                    });
                }

                if(canBeExtended && targetScheduleHour.place !== 0 &&
                    workPlaces.indexOf(targetScheduleHour.place) === -1)
                    canBeExtended = false;

                if(!isPlaceByDay && overlapsForBlocked.length > 0 || isPlaceByDay && targetScheduleHourArray.length > 0)
                    canBeBlocked = false;

                if(targetScheduleHourArray.length === 1 && targetScheduleHour.peopleId === 0) {
                    workPlacesForReplacement = [];
                    peopleIdsForReplacement = [];
                }

                if((targetScheduleHourArray.length === 1 || targetScheduleHourArrayAddit.length === 1)
                    && targetScheduleHour.place === 0 && overlapsForBlocked.length > 1)
                    canBeExtended = false;

                if(nothingCanDo) {
                    peopleIds = [];
                    workPlaces = [];
                }

                return {
                    targetScheduleHour: targetScheduleHour,
                    workPlaces: workPlaces,
                    workPlacesForReplacement: workPlacesForReplacement,
                    usersIds: peopleIds,
                    usersIdsForReplacement: peopleIdsForReplacement,
                    canBeDeletedOrReplaced: canBeDeletedOrReplaced,
                    canBeExtended: canBeExtended,
                    nothingCanDo: nothingCanDo,
                    canBeBlocked: canBeBlocked,
                    intersectWithTemp: intersectWithTemp
                };
            },
            getTakenWorkplaces: function(weekDates, workplaces, scheduleHours) {
                var workTimeLine = getCleanWorkTimeLine(weekDates);
                var takenWorkplaces = [];
                var value, momentWrap, hour, day, iDay, i, length;
                var workplacesLength = workplaces.length;

                angular.forEach(scheduleHours, function(sh) {
                    momentWrap = moment(sh.dateHourStart);
                    hour = momentWrap.hours();
                    day = momentWrap.format('YYYY-MM-DD');
                    iDay = weekDates.indexOf(day);
                    length = sh.hours;

                    for(i = 0; i < length; i++) {
                        if(hour + i === 24) {
                            ++iDay;
                            length -= i;
                            hour = 0;
                            i = 0;
                        }

                        if(iDay > 8)
                            continue;

                        value = workTimeLine[iDay][hour + i] + 1;
                        if (value === workplacesLength)
                            takenWorkplaces.push({day: weekDates[iDay], hour: hour + i});
                        workTimeLine[iDay][hour + i] = value;
                    }
                });
                return takenWorkplaces;
            },
            splitScheduleHours: function(scheduleHours) {
                var blockedScheduleHours = [], workedScheduleHours = [];
                angular.forEach(scheduleHours, function(sh) {
                    if(sh.peopleId === 0)   blockedScheduleHours.push(sh);
                    else                    workedScheduleHours.push(sh);
                });
                return {
                    workedScheduleHours: workedScheduleHours,
                    blockedScheduleHours: blockedScheduleHours
                }
            },
            containsInTemp: function(scheduleHoursWithoutTemp, tempAddedScheduleHours) {
                var shRange, tashRange, intersectRange, isOverlaps, isSamePlace, commonScheduleHour,
                    isBlockedPlace, isSamePerson, errors = [];

                angular.forEach(scheduleHoursWithoutTemp, function(sh) {
                    shRange = getRange(sh.dateHourStart, sh.hours);
                    angular.forEach(tempAddedScheduleHours, function(tash) {
                        tashRange = getRange(tash.dateHourStart, tash.hours);

                        isOverlaps = shRange.overlaps(tashRange);
                        isSamePlace = sh.place === tash.place;
                        isBlockedPlace = sh.place === 0;
                        isSamePerson = sh.peopleId == tash.peopleId;

                        if(isOverlaps && ((isSamePlace || isBlockedPlace) || isSamePerson)) {
                            intersectRange = shRange.intersection(tashRange);
                            commonScheduleHour = {
                                dateHourStart: intersectRange.start().format('YYYY-MM-DD HH:mm:ss'),
                                hours: intersectRange.length("hours")};
                            errors.push(commonScheduleHour);
                        }
                    });
                });

                return errors;
            },
            scheduleHoursWithoutTemp: function(scheduleHours, tempRemovedScheduleHours) {
                var index;
                angular.forEach(tempRemovedScheduleHours, function(tesh) {
                    index = indexOf(tesh, scheduleHours);
                    if(index !== -1)
                        scheduleHours.splice(index, 1);
                });
                return scheduleHours;
            }
        }
    });