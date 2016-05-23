angular
    .module('ScheduleModule')
    .directive('schedule', function($rootScope, $document, moment, orientationEnum, weekService, scheduleHourService,
                                    userService, command, authorityEnum, lodash) {
        var self = this;

        self.nameByDay = [];
        self.dayByName = [];
        self.placeByDay = [];
        self.scrollLeftRotateTable = 0;

        /**
         * Method forEachScheduleCell
         * @param sh
         * @param callback
         */
        function forEachScheduleCell(sh, callback) {
            var date, indexDay, startHour, i, length;
            date = moment(sh.dateHourStart);
            startHour = date.hours();
            length = sh.hours;
            indexDay = 0;

            for(i = 0; i < length; i++) {
                if(startHour + i === 24) {
                    ++indexDay;
                    length -= i;
                    startHour = 0;
                    i = 0;
                }
                callback(indexDay, startHour + i, i);
            }
        }

        /**
         * Method fillCellsWithGreenColor
         * Low-level method to adding or removing green filling from cell element
         * @param tb is target tbody element
         * @param tr is target tr element
         * @param td is target td element
         * @param length is number of cells that should be filled with green color
         * @param enabled if true - cell should be filled with green color, if false - green filling should be removed
         */
        function fillCellsWithGreenColor(tb, tr, td, length, enabled) {
            var element = angular.element('td[tb = ' + tb + '][tr = ' + tr + '][td = ' + td + ']');
            var time = angular.element('th[th = ' + td + ']');
            var title = angular.element('td[ttb = ' + tb + '][ttr = ' + tr +  ']');

            for(var i = 0; i < length; i++) {
                enabled ?
                    element = element.addClass('green').next('td') :
                    element = element.removeClass('green').next('td');

                enabled ?
                    time = time.addClass('green-text').next('th') :
                    time = time.removeClass('green-text').next('th');
            }

            enabled ?
                title.addClass('green-text').next('th') :
                title.removeClass('green-text').next('th');
        }

        /**
         * Method showGreenLine
         * Fill cells of person's schedules with green color for good visual displaying of occupied hours
         * If insufficient days for filling, it's transferred to next day
         * @param event that fired up when user click to cell
         * @param enabled: if true - cell should be filled with green color, if false - green filling should be removed
         * @param orientation
         * @param sessionLength
         */
        function showGreenLine(event, enabled, orientation, sessionLength) {
            var tb, tr, td, atFirstSession, atSecondSession, startOfDay;
            tb = parseInt(angular.element(event.target).attr('tb'));
            tr = parseInt(angular.element(event.target).attr('tr'));
            td = parseInt(angular.element(event.target).attr('td'));

            if(td + sessionLength <= 24)
                fillCellsWithGreenColor(tb, tr, td, sessionLength, enabled, orientation);
            else {
                atFirstSession = 24 - td;
                atSecondSession = sessionLength - atFirstSession;
                startOfDay = 0;

                fillCellsWithGreenColor(tb, tr, td, atFirstSession, enabled);

                if (orientation === orientationEnum.DAYBYNAME)
                    fillCellsWithGreenColor(tb, tr + 1, startOfDay, atSecondSession, enabled, orientation);
                else if (orientation === orientationEnum.NAMEBYDAY || orientation === orientationEnum.PLACEBYDAY)
                    fillCellsWithGreenColor(tb + 1, tr, startOfDay, atSecondSession, enabled, orientation);
            }
        }

        var schedule = {

            /**
             * Method createCleanSchedule
             * @param users from server, for which should be created nameByDay and dayByName visualizations
             * @param orientation
             * @param places
             * @param user
             * @returns {Array} of tbodies for creation schedule's DOM
             */
            createCleanSchedule: function(users, orientation, places, user) {
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;
                var isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;

                var isAdmin = user.authority === 'ADMIN';

                var tbodies = [];                                       // result array
                var tbody, tr, td, span;                                // elements
                var iTd, iTr, iTbody;                                   // counters
                var isFirstTbody, isLastTbody, isFirstTr, isLastTr;     // checkers

                var daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн'];
                var daysLength = 24;
                var userIdsOrder = userService.getArrayOfIds(users);
                var userIds = userService.getArrayOfIdsOrderedBy(users, 'name');

                var nameFirst = isDayByName ? userIds : daysOfWeek;
                var nameSecond;
                if (isNameByDay) nameSecond = userIds;
                if (isDayByName) nameSecond = daysOfWeek;
                if (isPlaceByDay) nameSecond = places;

                for(isPlaceByDay ? iTbody = nameFirst.length - 1: iTbody = 0;
                    isPlaceByDay ? iTbody >= 0 : iTbody < nameFirst.length;
                    isPlaceByDay ? iTbody-- : iTbody++) {
                    isFirstTbody = iTbody === 0;
                    isLastTbody = iTbody === nameFirst.length - 1;

                    /**
                     * Skip if it's dayByName visualization with first or last Tbody element
                     * Necessary for deleting additional Tbodies
                     * for Sunday of last week and Monday of next week
                     */
                    if ((isNameByDay || isPlaceByDay) && (isFirstTbody || isLastTbody))
                        continue;

                    tbody = angular.element('<tbody/>');

                    // Special first tbody without additional Sunday of last week
                    if (isNameByDay || isPlaceByDay) isFirstTbody = iTbody === 0 + 1;

                    for(isPlaceByDay ? iTr = nameSecond.length - 1 : iTr = 0;
                        isPlaceByDay ? iTr >= 0 : iTr < nameSecond.length;
                        isPlaceByDay ? iTr-- : iTr++) {

                        isFirstTr = iTr === 0;
                        isLastTr = iTr == nameSecond.length - 1;
                        tr = angular.element('<tr/>');

                        if((isNameByDay || isDayByName) && !(iTr % nameSecond.length) || (isPlaceByDay && isLastTr)) {

                            if(isDayByName && isAdmin)
                                span = angular.element('<span person-id="' + userIds[iTbody] + '">' + users[userIds[iTbody]].name + '</span>');
                            if(isDayByName && !isAdmin)
                                span = angular.element('<span person-id="' + userIds[iTbody] + '"/>');
                            if(isNameByDay || isPlaceByDay)
                                span = angular.element('<span>' + daysOfWeek[iTbody] + '</span>');

                            td = angular.element('<td rowspan="' + nameSecond.length + '"></td>');

                            if(isNameByDay || isPlaceByDay) td.addClass('day-by-name');

                            if(isDayByName) td.addClass('person-name');
                            else            td.addClass('day-name');

                            td.append(span);

                            if (isDayByName)
                                td.append(angular.element('<span with-hours class="layout-margin block"/>'));

                            td.addClass('title md-headline');
                            if(isPlaceByDay) td.addClass('rotate');
                            tr.append(td);
                        }

                        if (isDayByName)    span = angular.element('<span>' + daysOfWeek[iTr] + '</span>');
                        if (isNameByDay)    span = angular.element('<span>' + users[userIds[iTr]].name + '</span>');
                        if (isPlaceByDay)   span = angular.element('<span>' + places[iTr] + '</span>');

                        td = angular.element('<td ttb=' +iTbody + ' ttr=' + iTr + '></td>');

                        if(isNameByDay || isPlaceByDay) td.addClass('day-by-name');
                        if(isDayByName && (isFirstTr || isLastTr)) span.addClass('anotherWeek');

                        if(isNameByDay || isPlaceByDay) td.addClass('person-name');
                        if(isDayByName) td.addClass('day-name');

                        td.append(span);
                        td.addClass('title md-subhead');
                        if(isPlaceByDay) td.addClass('rotate');
                        tr.append(td);

                        for(iTd = 0; iTd < daysLength; iTd++) {
                            td = angular.element('<td/>');
                            td.attr('tb', iTbody);
                            td.attr('tr', iTr);
                            td.attr('td', iTd);

                            isDayByName && (isFirstTr || isLastTr) ?
                                td.addClass('anotherWeek') : td.addClass('active-td');

                            tr.append(td);
                        }

                        if(isPlaceByDay) {
                            span = angular.element('<span>' + places[iTr] + '</span>');
                            td = angular.element('<td ttb=' +iTbody + ' ttr=' + iTr + '></td>');
                            td.addClass('day-by-name person-name title md-subhead rotate');
                            td.append(span);
                            tr.append(td);
                        }

                        if(isPlaceByDay && isLastTr) {
                            span = angular.element('<span>' + daysOfWeek[iTbody] + '</span>');
                            td = angular.element('<td rowspan="' + nameSecond.length + '"></td>');
                            td.addClass('day-by-name day-name title md-headline rotate');
                            td.append(span);
                            tr.append(td);
                        }

                        tbody.append(tr);
                    }

                    tbody.append(tr);
                    tbodies.push(tbody);
                }
                return tbodies;
            },

            /**
             * Method getCleanSchedule
             * Add to given element clean schedule block
             * @param element to adding clean schedule block
             * @param orientation is form of visualization
             * @param users
             * @param user
             */
            getCleanSchedule: function(element, orientation, users, user) {
                var userIndex;
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;
                var isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;
                var elements, i, first, last, el;

                var isUser = user.authority === 'USER';


                if (orientation === orientationEnum.DAYBYNAME) elements = angular.copy(self.dayByName);
                if (orientation === orientationEnum.NAMEBYDAY && !isUser) elements = angular.copy(self.nameByDay);
                if (orientation === orientationEnum.PLACEBYDAY && !isUser) elements = angular.copy(self.placeByDay);

                if(isUser) {
                    userIndex = userService.getArrayOfIds(users).indexOf(user.peopleId.toString());
                    element.append(elements[userIndex]);
                }
                if(!isUser)
                    for(i = 0; i < elements.length; i++) {
                        first = i === 0;
                        last = i === elements.length - 1;

                        el = elements[i];

                        if(!first && (isNameByDay || isDayByName) || isPlaceByDay)
                            el.prepend(angular.element('<tr><td colspan="26" class="divider"></td></tr>'));

                        element.append(el);

                        if(isNameByDay && !last || isPlaceByDay && !last)
                            el.append(angular.element('<tr><td colspan="28" class="divider border"></td></tr>'));
                    }

                return schedule;
            },

            /**
             * Method removeSchedule
             * Removes schedule block from schedule
             */
            removeSchedule: function($element) {
                angular.element('div[person-name]').remove();
                angular.element($element.find('tbody')).remove();
                return schedule;
            },

            /**
             * Method addActionListenersToScheduleBlock
             * Monitors user's activity on cells
             * @param $scope
             * @param orientation
             * @param sessionLength
             * @param users
             * @param weekDates
             * @param workplaces
             * @param user
             */
            addActionListeners: function($scope, orientation, sessionLength, users, weekDates, workplaces, user) {
                angular.element(document)
                    .off("mouseenter mouseleave mouseover mouseout click", "td.active-td")
                    .on({
                        "mouseover": function() {
                            $scope.$parent.sch.hasAction = true;
                            self.scrollLeftRotateTable = angular.element('[table-container]').scrollLeft();
                        },
                        "mouseenter": function(event) {
                            showGreenLine(event, true, orientation, sessionLength);
                        },
                        "mouseleave": function(event) {
                            showGreenLine(event, false, orientation, sessionLength);
                        },
                        "click": function(event) {
                            var date, newScheduleHour, place = 0, peopleId = undefined;
                            var tb = parseInt(angular.element(event.target).attr('tb'));
                            var tr = parseInt(angular.element(event.target).attr('tr'));
                            var td = parseInt(angular.element(event.target).attr('td'));

                            var userIdsOrder = userService.getArrayOfIdsOrderedBy(users, 'name');
                            var userIds = userService.getArrayOfIds(users);

                            if(orientation === orientationEnum.PLACEBYDAY)
                                self.scrollLeftRotateTable = angular.element('[table-container]').scrollLeft();

                            if (orientation === orientationEnum.DAYBYNAME) {
                                peopleId = userIdsOrder[userIdsOrder.indexOf(userIds[tb])];
                                date = weekDates[tr]
                            }

                            if (orientation === orientationEnum.NAMEBYDAY) {
                                date = weekDates[tb];
                                peopleId = userIdsOrder[userIdsOrder.indexOf(userIds[tr])];
                                console.log(peopleId);
                            }

                            if (orientation === orientationEnum.PLACEBYDAY) {
                                date = weekDates[tb];
                                place = workplaces[tr];
                            }

                            newScheduleHour = {
                                dateHourStart: moment(date).hours(td).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
                                hours: sessionLength,
                                peopleId: peopleId,
                                place: place
                            };

                            $scope.$parent.sch.selectWorkplace(event, newScheduleHour, orientation, userIds, user);
                        }
                    }, "td.active-td");

                return schedule;
            },

            /**
             * Method addDataToSchedule
             * Fills schedule's block with data from repository
             * @param scheduleHours is repository with schedule's data from server
             * @param orientation is form of visualization
             * @param sessionLength
             * @param users
             * @param weekDates
             * @param workplaces
             * @param isReady
             */
            addDataToSchedule: function(scheduleHours, orientation, sessionLength, users, weekDates, workplaces, isReady) {
                var date, peopleIdIndex, datesIndex, placeIndex, tb, tr, td, text, element, query, user, offset,
                    div, table, length, top, left, hour;
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;
                var isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;

                var peopleIds = userService.getArrayOfIds(users);

                top = isReady ? 20 : 20;
                left = isReady ? 5 : -133;

                if(isPlaceByDay) {
                    angular.element('[table-container]').scrollLeft(150);
                    angular.element('#table').removeClass('rotate place-by-day');
                }

                angular.forEach(scheduleHours, function(sh) {
                    date = moment(sh.dateHourStart);

                    peopleIdIndex = peopleIds.indexOf(sh.peopleId.toString());
                    datesIndex = weekDates.indexOf(date.format('YYYY-MM-DD'));
                    placeIndex = workplaces.indexOf(sh.place);

                    tb = isDayByName ? peopleIdIndex : datesIndex;
                        if (isNameByDay)    tr = peopleIdIndex;
                        if (isDayByName)    tr = datesIndex;
                        if (isPlaceByDay)   tr = placeIndex;
                    td = date.hours();

                    text = isPlaceByDay ? sh.peopleId : sh.place;

                    if(!((isNameByDay || isPlaceByDay) && (datesIndex === 0 || datesIndex === 8)))
                        forEachScheduleCell(sh, function(iDay, iHour, i) {
                            if(isDayByName)
                                query = 'td[tb = ' + tb + '][tr = ' + (tr + iDay) + '][td = ' + iHour + ']';
                            if(isNameByDay || isPlaceByDay)
                                query = 'td[tb = ' + (tb + iDay) + '][tr = ' + tr + '][td = ' + iHour + ']';

                            element = angular.element(query);

                            if(isDayByName || isNameByDay)
                                element.text(text);
                            if(isPlaceByDay) {
                                user = users[text.toString()];
                                length = td + sh.hours < 24
                                    ? sh.hours : iDay === 0 ? 24 - td : sh.hours - (24 - td);
                                element.addClass('person' + peopleIdIndex);
                            }

                            if(isPlaceByDay && length >= 3 && (iHour === 0 || i === 0)) {
                                offset = element.position();
                                var time = date.format('YYYY-MM-DD-HH');
                                query = '<div person-name place=' + sh.place + ' hour= ' + time + '>' + user.name + '</div>';
                                div = angular.element(query);
                                div.css({
                                    top: offset.top + top,
                                    left: offset.left + left,
                                    height: length * 34
                                });
                                table = angular.element(document.getElementById('table'));
                                table.append(div);
                            }
                        });
                });

                // After rotating width of block changes and position of scroll is lost
                if(isPlaceByDay) {
                    angular.element('#table').addClass('rotate place-by-day');
                    angular.element('[table-container]').scrollLeft(self.scrollLeftRotateTable);
                }

                return schedule;
            },

            /**
             * Method addWorkHoursToPersons
             * @param scheduleHours
             * @param users
             * @param currentWeek
             * @param orientation
             */
            addWorkHoursToPersons: function(scheduleHours, users, currentWeek, orientation) {
                if(orientation === orientationEnum.DAYBYNAME) {
                    var hours, range, personId, hoursAtCurrentWeek, i = 0;
                    var usersTemp = userService.resetWorkHours(users);
                    var personIds = angular.element('span[person-id]');
                    var elements = angular.element(document.querySelectorAll("[with-hours]"));

                    var userIdsOrder = userService.getArrayOfIdsOrderedBy(users, 'name');
                    var userIds = userService.getArrayOfIds(users);

                    angular.forEach(scheduleHours, function(sh) {
                        if(sh.peopleId != 0) {
                            range = moment.duration(sh.hours, 'hours').afterMoment(sh.dateHourStart);
                            if(currentWeek.currentWeekNormal.overlaps(range)) {
                                hoursAtCurrentWeek = range.intersection(currentWeek.currentWeekNormal).asDuration('days').asHours();
                                usersTemp[sh.peopleId.toString()].hours += Math.round(hoursAtCurrentWeek);
                            }
                        }
                    });

                    angular.forEach(personIds, function(id) {
                        personId = parseInt(angular.element(id).attr('person-id'));
                        hours = usersTemp[parseInt(userIds[userIdsOrder.indexOf(personId.toString())])].hours;
                        angular.element(elements[i]).text(hours + ' ч. ');
                        i++;
                    });
                }

                return schedule;
            },

            /**
             * Method blockedWorkplaces
             * @param cmd
             * @param blockedCells
             * @param orientation
             * @param weekDates
             */
            blockedWorkplaces: function(cmd, blockedCells, orientation, weekDates) {
                var elements, element, iDay, iHour, query;
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;

                angular.forEach(blockedCells, function(blockedCell) {
                    iDay = weekDates.indexOf(blockedCell.day);
                    iHour = blockedCell.hour;

                    if (isDayByName)
                        query = 'td[tr = ' + iDay + '][td = ' + iHour + ']';
                    if (isNameByDay)
                        query = 'td[tb = ' + iDay + '][td = ' + iHour + ']';

                    elements = angular.element(query);

                    angular.forEach(elements, function(el) {
                        element = angular.element(el);
                        if(cmd === command.ADD && element.text() === '')
                            element.addClass('blocked');
                        if(cmd === command.CLEAR)
                            element.removeClass('blocked');
                    });
                });

                return schedule;
            },

            /**
             * Method addBlockedByAdmin
             * @param blockedScheduleHours
             * @param orientation
             * @param sessionLength
             * @param weekDates
             * @param workplaces
             */
            addBlockedByAdmin: function(blockedScheduleHours, orientation, sessionLength, weekDates, workplaces) {
                var isBlockedAllWorkplaces, elements, query, date, iDay, iPlace;
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;
                var isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;

                angular.forEach(blockedScheduleHours, function(sh) {
                    date = moment(sh.dateHourStart);
                    iDay = weekDates.indexOf(date.format('YYYY-MM-DD'));
                    iPlace = workplaces.indexOf(sh.place);
                    isBlockedAllWorkplaces = sh.place === 0;

                    forEachScheduleCell(sh, function(indexDay, indexHour) {
                        if (isBlockedAllWorkplaces && isDayByName)
                            query = 'td[tr = ' + (iDay + indexDay) + '][td = ' + indexHour + ']';
                        if (isBlockedAllWorkplaces && (isNameByDay || isPlaceByDay))
                            query = 'td[tb = ' + (iDay + indexDay) + '][td = ' + indexHour + ']';
                        if (!isBlockedAllWorkplaces && isPlaceByDay)
                            query = 'td[tb = ' + (iDay + indexDay) + '][tr = ' + iPlace + '][td = ' + indexHour + ']';

                        elements = angular.element(query).addClass('block-admin');
                    });
                });

                return schedule;
            },

            /**
             * Method checkTempWithServer
             * @param cmd
             * @param tempErrors
             * @param weekDates
             * @param users
             */
            checkTempWithServer: function(cmd, tempErrors, weekDates, users) {
                var itr, query, element;
                var userIds = userService.getArrayOfIds(users);
                var personId = parseInt(angular.element('span[person-id]').attr('person-id'));
                var iPerson = userIds.indexOf(personId.toString());

                angular.forEach(tempErrors, function(ir) {
                    itr = weekDates.indexOf(moment(ir.dateHourStart).format('YYYY-MM-DD'));

                    forEachScheduleCell(ir, function(iDay, iHour) {
                        query = 'td[tb = ' + iPerson + '][tr = ' + (itr + iDay) + '][td = ' + iHour + ']';
                        element = angular.element(query);

                        if(cmd === command.ADD)   element.addClass('error');
                        if(cmd === command.CLEAR) element.removeClass('error');
                    });
                });

                return schedule;
            },

            /**
             * Method clearCurrentSchedule
             * @param scheduleHours
             * @param orientation
             * @param users
             * @param weekDates
             * @param workplaces
             */
            clearCurrentSchedule: function(scheduleHours, orientation, users, weekDates, workplaces) {
                var date, peopleIdIndex, datesIndex, placeIndex, tb, tr, td, text, element, query, hour,
                    isBlockedPlace, isBlockedAllWorkplaces;
                var isDayByName = orientation === orientationEnum.DAYBYNAME;
                var isNameByDay = orientation === orientationEnum.NAMEBYDAY;
                var isPlaceByDay = orientation === orientationEnum.PLACEBYDAY;
                var peopleIds = Object.keys(users);

                angular.forEach(scheduleHours, function(sh) {
                    date = moment(sh.dateHourStart);
                    isBlockedPlace = sh.peopleId == 0;
                    isBlockedAllWorkplaces = sh.place === 0 && sh.peopleId == 0;

                    peopleIdIndex = peopleIds.indexOf(sh.peopleId.toString());
                    datesIndex = weekDates.indexOf(date.format('YYYY-MM-DD'));
                    placeIndex = workplaces.indexOf(sh.place);

                    tb = isDayByName ? peopleIdIndex : datesIndex;
                    if (isDayByName)    tr = datesIndex;
                    if (isNameByDay)    tr = peopleIdIndex;
                    if (isPlaceByDay)   tr = placeIndex;
                    td = date.hours();

                    text = isPlaceByDay ? sh.peopleId : sh.place;

                    angular
                        .element('div[person-name][place=' + sh.place + '][hour=' + date.format('YYYY-MM-DD-HH') + ']')
                        .remove();

                    forEachScheduleCell(sh, function(iDay, iHour) {
                        if(isDayByName && !isBlockedAllWorkplaces)
                            query = 'td[tb = ' + tb + '][tr = ' + (tr + iDay) + '][td = ' + iHour + ']';
                        if((isNameByDay || isPlaceByDay) && !isBlockedAllWorkplaces)
                            query = 'td[tb = ' + (tb + iDay) + '][tr = ' + tr + '][td = ' + iHour + ']';
                        if (isBlockedAllWorkplaces && isDayByName)
                            query = 'td[tr = ' + (tr + iDay) + '][td = ' + iHour + ']';
                        if (isBlockedAllWorkplaces && (isNameByDay || isPlaceByDay))
                            query = 'td[tb = ' + (tb + iDay) + '][td = ' + iHour + ']';

                        element = angular.element(query);

                        if((isDayByName || isNameByDay) && !isBlockedAllWorkplaces)
                            element.empty();
                        if(isPlaceByDay && !isBlockedAllWorkplaces && !isBlockedPlace)
                            element.removeClass('person' + peopleIdIndex);
                        if(isBlockedPlace || isBlockedAllWorkplaces)
                            element.removeClass('block-admin');
                    });
                });

                return schedule;
            }
        };

        return {
            restrict: 'A',
            scope: {
                scheduleHours: '=',
                blockedScheduleHours: '=',
                user: '=',
                users: '=',
                tempAddedScheduleHours: '=',
                orientation: '=',
                currentWeek: '=',
                tempErrors: '=',
                properties: '=',
                isPlanningDay: '='
            },
            controller: function($scope, $element) {
                var properties, orientation, currentWeek, scheduleHours, users, userIds, currentWeekDates,
                    isReady, sessionLength, workplaces, sh, user, isPlanningDay, tempAddedScheduleHours,
                    pastWeek, pastWeekDates, tempErrors, pastTempErrors, added, removed, addedScheduleHours,
                    addedBlockedScheduleHours, changeWeek, weekDates, blockedCells = [], removedBlockedCells,
                    blockedScheduleHours = [];

                tempAddedScheduleHours = $scope.tempAddedScheduleHours;
                isPlanningDay = $scope.isPlanningDay;
                orientation = $scope.orientation;
                currentWeek = $scope.currentWeek;
                users = $scope.users;
                scheduleHours = $scope.scheduleHours;
                orientation = $scope.orientation;
                user = $scope.user;
                tempErrors = $scope.tempErrors;

                properties = $scope.properties;
                sessionLength = properties.sessionLength;
                workplaces = properties.workplaces;

                $scope.$watch('tempErrors', function(newValue) {
                    pastTempErrors = tempErrors;
                    tempErrors = newValue;
                });

                $scope.$watch('tempAddedScheduleHours', function(newValue) {
                    tempAddedScheduleHours = newValue;
                });

                $scope.$watch('currentWeek', function(newValue, oldValue) {
                    currentWeek = newValue;
                    pastWeek = oldValue;
                    currentWeekDates = weekService.getArrayOfDates(currentWeek);
                    pastWeekDates = weekService.getArrayOfDates(pastWeek);
                    changeWeek = true;
                });

                $scope.$watch('users', function(newValue) {
                    users = newValue;

                    if(users === undefined || Object.keys(users).length === 0) return;

                    self.nameByDay = schedule.createCleanSchedule(users, orientationEnum.NAMEBYDAY, properties.workplaces, user);
                    self.dayByName = schedule.createCleanSchedule(users, orientationEnum.DAYBYNAME, properties.workplaces, user);
                    self.placeByDay = schedule.createCleanSchedule(users, orientationEnum.PLACEBYDAY, properties.workplaces, user);

                    userIds = userService.getArrayOfIds(users);

                    $scope.$watch('orientation', function(newValue) {
                        orientation = newValue;
                        isReady = false;

                        schedule
                            .removeSchedule($element)
                            .getCleanSchedule($element, orientation, users, user)
                            .addActionListeners($scope, orientation, sessionLength, users, currentWeekDates, workplaces, user)
                            .addDataToSchedule(scheduleHours, orientation, sessionLength, users, currentWeekDates, workplaces, isReady)
                            .addWorkHoursToPersons(scheduleHours, users, currentWeek, orientation)
                            .addBlockedByAdmin(blockedScheduleHours, orientation, sessionLength, currentWeekDates, workplaces)
                            .blockedWorkplaces(command.ADD, blockedCells, orientation, currentWeekDates);
                    });

                    $scope.$watchCollection('scheduleHours', function(newValue, oldValue) {
                        isReady = true;

                        sh = scheduleHourService.splitScheduleHours(newValue);
                        scheduleHours = sh.workedScheduleHours;
                        blockedScheduleHours = sh.blockedScheduleHours;
                        weekDates = currentWeekDates;

                        added = lodash.differenceWith(newValue, oldValue, scheduleHourService.equals);
                        removed = lodash.differenceWith(oldValue, newValue, scheduleHourService.equals);
                        sh = scheduleHourService.splitScheduleHours(added);
                        addedScheduleHours = sh.workedScheduleHours;
                        addedBlockedScheduleHours = sh.blockedScheduleHours;

                        removedBlockedCells = blockedCells;
                        blockedCells = scheduleHourService.getTakenWorkplaces(weekDates, workplaces, newValue);

                        if(changeWeek) {
                            addedScheduleHours = scheduleHours;
                            addedBlockedScheduleHours = blockedScheduleHours;
                            removed = oldValue;
                            weekDates = pastWeekDates;
                            changeWeek = false;
                        }

                        schedule
                            .clearCurrentSchedule(removed, orientation, users, weekDates, workplaces)
                            .blockedWorkplaces(command.CLEAR, removedBlockedCells, orientation, weekDates)
                            .addActionListeners($scope, orientation, sessionLength, users, currentWeekDates, workplaces, user)
                            .addDataToSchedule(addedScheduleHours, orientation, sessionLength, users, currentWeekDates, workplaces, isReady)
                            .addWorkHoursToPersons(newValue, users, currentWeek, orientation)
                            .addBlockedByAdmin(addedBlockedScheduleHours, orientation, sessionLength, currentWeekDates, workplaces)
                            .blockedWorkplaces(command.ADD, blockedCells, orientation, currentWeekDates);

                        if(user.authority === authorityEnum.USER)
                            schedule
                                .checkTempWithServer(command.CLEAR, pastTempErrors, currentWeekDates, users)
                                .checkTempWithServer(command.ADD, tempErrors, currentWeekDates, users);
                    });

                    $scope.$watch('isPlanningDay', function(newValue) {
                        isPlanningDay = newValue;
                        if(isPlanningDay || user.authority === authorityEnum.ADMIN)
                            schedule
                                .addActionListeners($scope, orientation, sessionLength, users, currentWeekDates, properties.workplaces, user);
                        if(!isPlanningDay && user.authority === authorityEnum.USER)
                            angular.element(document)
                                .off("mouseenter click", "td.active-td");
                    });

                });
            }
        }
    });