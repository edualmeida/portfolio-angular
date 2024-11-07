function getCalendarEvents(fetchInfo, successCallback, failureCallback) {

    console.log('getCalendarEvents.start: ' + fetchInfo.start);
    console.log('getCalendarEvents.end: ' + fetchInfo.end);

    var startFormat = moment(fetchInfo.start).format(_sourceDateFormat);
    var endFormat = moment(fetchInfo.end).format(_sourceDateFormat);

    console.log('getCalendarEvents.startFormat: ' + startFormat);
    console.log('getCalendarEvents.endFormat: ' + endFormat);
    $.ajax({
        type: "GET",    //WebMethods will not allow GET
        //url: "/Schedule/Index?handler=CalendarEvents?start=" + startFormat + "&end=" + endFormat,
        url: "/Schedule/Index?handler=CalendarEvents",
        data: {
            start: startFormat,
            end: endFormat
        },
        //completely take out 'data:' line if you don't want to pass to webmethod - Important to also change webmethod to not accept any parameters
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (doc) {
            var events = [];   //javascript event object created here
            var obj = doc;
            $(obj).each(function () {
                events.push({
                    title: $(this).attr('title'),  //your calevent object has identical parameters 'title', 'start', ect, so this will work
                    start: moment($(this).attr('start'), _sourceDateFormat).toDate(), // will be parsed into DateTime object
                    end: moment($(this).attr('end'), _sourceDateFormat).toDate(),
                    id: $(this).attr('id'),
                    description: $(this).attr('description'),
                    allDay: $(this).attr('allDay')
                });
            });
            if (successCallback) {
                successCallback(events);
            }
        }
    });
}

function sendAddEvent(event) {
    axios({
        method: 'post',
        url: '/Schedule/Index?handler=Event',
        headers: {
            'XSRF-TOKEN': $('input:hidden[name="__RequestVerificationToken"]').val()
        },
        contentType: "application/json",
        dataType: "json",
        data: {
            "Title": event.title,
            "Description": event.description,
            "Start": event.startTime,
            "End": event.endTime,
            "AllDay": event.isAllDay
        }
    })
    .then(res => {
        const { message, Id } = res.data;
        if (message === '') {
            calendar.refetchEvents();
            $('#eventModal').modal('hide');
        } else {
            alert(`Something went wrong: ${message}`);
        }
    })
    .catch(err => alert(`Something went wrong: ${err}`));
}

function sendUpdateEvent(eventId, event) {
    axios({
        method: 'post',
        url: '/Schedule/Index?handler=UpdateEvent',
        headers: {
            'XSRF-TOKEN': $('input:hidden[name="__RequestVerificationToken"]').val()
        },
        dataType: "json",
        data: {
            "Id": eventId,
            "Title": event.title,
            "Description": event.description,
            "Start": event.startTime,
            "End": event.endTime,
            "AllDay": event.isAllDay
        }
    })
        .then(res => {
            const { message } = res.data;
            if (message === '') {

                calendar.refetchEvents();
                $('#eventModal').modal('hide');
            } else {
                toastr.error(`Something went wrong: ${message}`, 'Error');
            }
        })
        .catch(err => alert(`Something went wrong: ${err}`));
}

function sendDeleteEvent(eventId) {
    axios({
        method: 'post',
        url: '/Schedule/Index?handler=DeleteEvent',
        headers: {
            'XSRF-TOKEN': $('input:hidden[name="__RequestVerificationToken"]').val()
        },
        dataType: "json",
        data: {
            "eventId": eventId
        }
    })
        .then(res => {
            const { message } = res.data;
            if (message === '') {

                calendar.refetchEvents();
                $('#confirmDeleteModal').modal('hide');
                $('#eventModal').modal('hide');

                toastr.success('Event deleted successfully');
            } else {
                toastr.error('Something went wrong: ${message}', 'Error');
            }
        })
        .catch(err => alert('Something went wrong: ${err}'));
}