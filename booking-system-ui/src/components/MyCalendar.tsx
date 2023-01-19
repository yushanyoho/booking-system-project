import { Calendar, Views, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BookingSystemContext from '../context/BookingSystemContext';
import { useCallback, useContext, useState } from 'react';
import { Container, } from '@mui/material';
import EventDetailsModal from './EventDetailsModal';
import ErrorModal from './ErrorModal';
import NewAvailabilityModal from './NewAvailabilityModal';
import { Event } from '../utils/CalendarUtils'; 
import useCalendar from '../hooks/useCalendar';

export default function MyCalendar(): React.ReactElement {
  const { role } = useContext(BookingSystemContext); // 从context中拿到当前登录用户的role
  const isInstructor = role === 'Instructor'; // 判断当前登录用户是否为instructor，供 useCalendar() 使用

  // string | function (event: Object) => string
  // used to display event information
  const titleAccessor = useCallback(
    (e: Event) => {
      if (e.type === 'Reservation') {
        // 如果event type为reservation，显示title + participant，如 'Mock Interview with YYY'
        return `${e.title} with ${isInstructor ? e.student : e.instructor}`;
      } else {
        // 如果event type为available，显示 'Available'
        return 'Available';
      }
    }, // e.type === 'Reservation' ? `${e.title} with ${isInstructor ? e.student : e.instructor}` : 'Available',
    [isInstructor]
  );

  // Custom hooks to get useful value
  const {
    localizer,
    selectedReservation,
    setSelectedReservation,
    events,
    setEvents,
    error,
    setError,
    onDetailsModalClose,
    onRangeChange,
  } = useCalendar(isInstructor); // if user is an instructor, include availability

  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const onConfirmationModalClose = useCallback(
    () => {
      setSelectedSlot(null);
    }, []
  );

  const onErrorModalClose = useCallback(
    () => { 
      setError(null); 
      setSelectedSlot(null);
    }, [setError]
  );

  const onSelectedSlot = useCallback((slot: SlotInfo) => {
    const overlap = events.some(event =>
      event.end > slot.start && event.start < slot.end
    );
    const now = new Date();
    if (overlap) {
      setError('Your new availability cannot overlap with existing events');
    } else if (slot.start < now) {
      setError('Your cannot create availability for past');
    } else {
      setSelectedSlot(slot);
    }
  }, [events, setError]);

  const onEventSelected = useCallback(
    (event) => {
      // 如果点击了一个 reservation，将selectedReservation设为该event以调用 <EventDetailsModal />
      if (event.type === 'Reservation') {
        setSelectedReservation(event);
      } // else if (event.type === 'Availability') {/* do nothing */}
    }, [setSelectedReservation]
  );

  return (
    <>
      <Container>
        <Calendar
          popup // boolean, show truncated events in an overlay when you click the "+x more" link.
          titleAccessor={titleAccessor} // string | function (event: Object) => string, used to display event information
          localizer={localizer} // instanceOf(DateLocalizer) required, userd for formatting dates and time
          events={events} // Array<Event>, default: [], and array of event objects to display on the calendar. Events object can be any shape.
          views={[Views.WEEK]} // type: View 每页显示可选view names: MONTH | WEEK | WORK_WEEK | DAY | AGENDA
          view={Views.WEEK} // The current view value of the calendar. Controlled by onView={}

          // Instructor: 允许拖拽选择slot但忽略event; Student: 不允许拖拽选择slot;
          selectable={isInstructor ? 'ignoreEvents' : false} // 允许鼠标拖拽选择slot，'ignoreEvents' prevents selection code from running when draging slots over events
          onSelectSlot={onSelectedSlot} // Callback fired when a SLOT selection is made, function (slot: SlotInfo) => void
          // onSelectEvent 与selectable无关，两者都允许select event
          onSelectEvent={onEventSelected} // Callback fired when a calendar event is selected, function (event: Object) => any (The event passed into the function is the Calendar Event, not the SyntheticEvent)

          onRangeChange={onRangeChange} // ((range: Date[] | { start: stringOrDate; end: stringOrDate }, view: View | undefined) => void) | undefined;
        />
      </Container>
      
      <EventDetailsModal
        reservation={selectedReservation} // 用 selectedReservation 是否为 null 来控制弹窗弹出
        onClose={onDetailsModalClose} // 点击关闭时将 selectedReservation 重置为 null
      />

      <ErrorModal
        errorMsg={error} // 用
        onClose={onErrorModalClose}
      />
      <NewAvailabilityModal
        slot={selectedSlot}
        onClose={onConfirmationModalClose}
        setEvents={setEvents}
        setError={setError}
      />
    </>
  );
}