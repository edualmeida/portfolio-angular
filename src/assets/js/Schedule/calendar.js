var calendar;
const _sourceDateFormat = "YYYY-MM-DDTHH:mmZ";
const datePickerFormat = "d/m/Y H:i";
const calendarDateFormat = 'DD/MM/YYYY HH:mm';
var isManager = false;
let currentEventId;
var fpStartTime;
var fpEndTime;
const formatDateFromCalendar = date => date === null ? '' : moment(date).format(calendarDateFormat);

document.addEventListener('DOMContentLoaded', function () {

    isManager = $('.isManager').val() === 'True';
    if (isManager) {
        fpStartTime = flatpickr("#StartTime", {
            enableTime: true,
            ariaDateFormat: datePickerFormat,
            dateFormat: datePickerFormat
        });

        fpEndTime = flatpickr("#EndTime", {
            enableTime: true,
            ariaDateFormat: datePickerFormat,
            dateFormat: datePickerFormat
        });
    }

    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        timeZone: 'UTC',
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dayHeaderFormat: function (objectCallback) {
            return moment(objectCallback.date).format('DD/MM');
        },
        eventClick: onCalendarUpdateEventClick,
        editable: false,
        selectable: isManager,
        select: (isManager ? onCalendarAddNewEvent : null),
        eventSourceFailure(error) {
            if (error) {
                console.log('Request to failed: ' + error);
            }
        },
        events: getCalendarEvents
    });
    
    calendar.render();
});

function onCalendarAddNewEvent(event) {

    $('#eventForm')[0].reset();
    $('#eventModalLabel').html('Add new event');
    $('#eventModalSave').html('Save');
    $('#isNewEvent').val(true);

    console.log('onCalendarAddNewEvent:');
    console.log(event.start);

    fpStartTime.setDate(formatDateFromCalendar(event.start));
    fpEndTime.setDate(formatDateFromCalendar(event.end));

    $('#eventModal').modal('show');
}

function onCalendarUpdateEventClick(item, element) {

    const currentEvent = item.event;
    currentEventId = currentEvent.id;
    if ($(this).data("qtip")) $(this).qtip("hide");

    if (isManager) {
        $('#eventModalLabel').html('Edit event');
        $('#eventModalSave').html('Save');
    } else {
        $('#eventModalLabel').html(currentEvent.title);
    }

    $('#EventTitle').val(currentEvent.title);
    $('#Description').val(currentEvent.extendedProps.description);
    $('#isNewEvent').val(false);

    const start = formatDateFromCalendar(currentEvent.start);
    const end = formatDateFromCalendar(currentEvent.end);

    if (isManager) {
        fpStartTime.setDate(start);
        fpEndTime.setDate(end);

    } else {
        $('#StartTime').val(start);
        $('#EndTime').val(end);
    }

    if (currentEvent.allDay) {
        $('#AllDay').prop('checked', 'checked');
    } else {
        $('#AllDay')[0].checked = false;
    }

    $('#eventModal').modal('show');
}

$('#eventModalSave').click(() => {

    console.log($('#StartTime').val());

    const title = $('#EventTitle').val();
    const description = $('#Description').val();
    const startTime = moment($('#StartTime').val(), calendarDateFormat);
    const endTime = moment($('#EndTime').val(), calendarDateFormat);
    const isAllDay = $('#AllDay').is(":checked");
    const isNewEvent = $('#isNewEvent').val() === 'true' ? true : false;

    if (!title) {
        toastr.warning('Please enter a Title');
        return;
    }

    if (startTime > endTime) {

        toastr.warning('Start Time cannot be greater than End Time');
        return;
    } else if ((!startTime.isValid() || !endTime.isValid()) && !isAllDay) {

        toastr.warning('Please enter both Start Time and End Time');
        return;
    }

    console.log('eventModalSave->');
    console.log(startTime);
    console.log('eventModalSave->' + endTime);
    const event = {
        title,
        description,
        isAllDay,
        startTime: startTime.format(_sourceDateFormat),
        endTime: endTime.format(_sourceDateFormat)
    };

    if (isNewEvent) {
        sendAddEvent(event);
    } else {
        sendUpdateEvent(currentEventId, event);
    }
});

$('#deleteEvent').click(() => {
    $('.modalConfirmDeleteEventTitle').text($('#EventTitle').val());
    $('#confirmDeleteModal').modal('show');
});

$('#modalConfirmDelete').click(() => {

    sendDeleteEvent(currentEventId);
});

$('#AllDay').on('change', function (e) {
    if (e.target.checked) {
        $('#EndTime').val('');
        fpEndTime.clear();
        this.checked = true;
    } else {
        this.checked = false;
    }
});

$('#EndTime').on('change', () => {
    $('#AllDay')[0].checked = false;
});
