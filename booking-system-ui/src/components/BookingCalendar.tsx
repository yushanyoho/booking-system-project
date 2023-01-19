import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCallback, useState } from 'react';
import { Container, } from '@mui/material';
import EventDetailsModal from './EventDetailsModal';
import NewMeetingModal from './NewReservationModal';
import useCalendar from '../hooks/useCalendar';
import { Event } from '../utils/CalendarUtils';
import ErrorModal from './ErrorModal';

export default function BookingCalendar(): React.ReactElement {
    const titleAccessor = useCallback(
        (e: Event) => e.title ?? '', // e.title 可能为null
        []
    );

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
    } = useCalendar(true); // <BookingCalendar /> 用于学生访问老师的页面，只会被InstructorView调用，所以可以 hard code true

    const [selectedAvailability, setSelectedAvailability] = useState<Event | null>(null);

    const onCreationModalClose = useCallback(
        () => { setSelectedAvailability(null); }, []
    );
    const onEventSelected = useCallback(
        (event) => {
            if (event.type === 'Reservation') {
                setSelectedReservation(event);
            } else {
                setSelectedAvailability(event);
            }
        }, [setSelectedReservation]
    );
    const onErrorModalClose = useCallback(
        () => { setError(null); }, [setError]
    );

    return (
        <>
            <Container>
                <Calendar
                    popup
                    localizer={localizer}
                    events={events}
                    views={[Views.WEEK]}
                    view={Views.WEEK}
                    titleAccessor={titleAccessor}
                    selectable={false}
                    onSelectEvent={onEventSelected}
                    onRangeChange={onRangeChange}
                />
            </Container>
            <EventDetailsModal
                reservation={selectedReservation}
                onClose={onDetailsModalClose}
            />
            <ErrorModal
                errorMsg={error}
                onClose={onErrorModalClose}
            />
            <NewMeetingModal
                availability={selectedAvailability}
                onClose={onCreationModalClose}
                setEvents={setEvents}
                setError={setError}
            />
        </>
    );
}