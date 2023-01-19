import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { DateLocalizer, momentLocalizer, View } from "react-big-calendar";
import { useParams } from "react-router";
import BookingSystemContext from "../context/BookingSystemContext";
import BookingSystemRequest from "../utils/BookingSystemRequest";
import { availabilityToEvents, DATE_FORMAT, Event, EventType, reservationToEvents } from '../utils/CalendarUtils';
import { RouteParams } from "../views/InstructorView";

interface CalendarState {
    localizer: DateLocalizer,
    selectedReservation: Event | null,
    setSelectedReservation: (e: Event | null) => void,
    events: Array<Event>,
    setEvents:(cb: Event[] | ((events: Event[]) => Event[])) => void,
    error: string | null,
    setError: (e: string | null) => void,
    onDetailsModalClose: () => void,
    onRangeChange: (range: any, view: any) => void, // ???
}

export default function useCalendar(includeAvailability: boolean): CalendarState {
    const localizer = momentLocalizer(moment);
    const [selectedReservation, setSelectedReservation] = useState<Event | null>(null);
    const [events, setEvents] = useState<Array<Event>>([]);
    const [error, setError] = useState<string | null>(null); // error 是一个 string

    // detail弹出框会在selectedReservation != null时弹出，点击关闭时恢复null
    const onDetailsModalClose = useCallback(
        () => { setSelectedReservation(null); }, []
    );

    // The `useParams` hook returns an object of key/value pairs of the dynamic params from
    // the current URL (matched by <Route path="...">). Child routes inherit all params from
    // their parent routes.
    // 从url中读取被访问者routeUsername
    const { username: routeUsername } = useParams<RouteParams>();

    // 从context中读取viewerUserName
    const {username: viewerUserName} = useContext(BookingSystemContext);

    const [rangeStart, setRangeStart] = useState(moment().startOf('week').toDate()); // Start Date of current week
    const [rangeEnd, setRangeEnd] = useState(moment().endOf('week').toDate()); // End Date of current week
    // format rangeStart and rangeEnd to string using DATE_FORMAT (from CalendarUtils)
    const rangeStartString = moment(rangeStart).format(DATE_FORMAT); // string: yyyy-MM-DD HH:mm
    const rangeEndString = moment(rangeEnd).format(DATE_FORMAT); // string: yyyy-MM-DD HH:mm

    /**
     * useEffect(): fetch events (availability / reservation) for use in <MyCalendar /> and <BookingCalendar />
     * 没有define在一个component内，useEffect()实际执行在什么时候？渲染完成之前还是之后？
     */
    useEffect(() => {

        // define a function that returns another function
        const onFetchSuccess = (type: EventType) => {

            // return a function to handle response after Successfully Fetching Reservations (onSuccess())
            return (response: string) => {
                // 将request返回的response (JSON) parse 为 object
                const parsed = JSON.parse(response);

                // 如果EventType为'Reservation'则该function应该调用reservationToEvents来处理response, parsed: Reservation[]
                // 如果EventType为'Availability'则该function应该调用availabilityToEvents来处理response, parsed: Availability[]
                // 为什么特意将 newEvents 定义为可变值 let？
                let newEvents = type === 'Reservation' ? reservationToEvents(parsed) : availabilityToEvents(parsed); // Event[]

                // 使用传入function的形式可以处理concurrency（为什么？具体机制是？）
                // fetch reservatioin 和 fetch availability是两个不同的request，React不会等fetch reservation成功后才发送availability的request
                // set availability / reservation 在时间上不会重叠（后端处理）
                setEvents((events) => [
                        ...events, // 将array展开并append
                        ...newEvents, // 将newEvents展开并append
                ]);
            };
        };
        
        setEvents([]);

        // 每个用户都有自己的reservation数据，fetch revervations of current week of viewer（登录用户）
        // e.g.: '/api/yyy/reservations?from=2023-01-23 00:00&to=2023-01-30 00:00'
        const reservationPath = `${viewerUserName}/reservations?from=${rangeStartString}&to=${rangeEndString}`;
        new BookingSystemRequest(reservationPath, 'GET')
            .onSuccess(onFetchSuccess('Reservation')) // 拿到一个调用reservationToEvents的function
            .onFailure(() => setError('There has been an error getting reservations'))
            .onError(() => setError('There has been an error getting reservations'))
            .send();

        // 只有instructor有自己的availability数据，fetch availabilities of current week of routeUser（访问用户）
        // e.g.: '/api/yyy/availabilities?from=from=2023-01-23 00:00&to=2023-01-30 00:00'
        if (includeAvailability) {
            const availabilityPath = `${routeUsername}/availabilities?from=${rangeStartString}&to=${rangeEndString}`;
            new BookingSystemRequest(availabilityPath, 'GET')
                .onSuccess(onFetchSuccess('Availability')) // 拿到一个调用availabilityToEvents的function
                .onFailure(() => setError('There has been an error getting availabilities'))
                .onError(() => setError('There has been an error getting availability'))
                .send();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rangeStartString, rangeEndString, includeAvailability]); // 只有view range发生改变的时候才重新 fetch events（刷新页面不会重新fetch？）

    // 当用户点击"Back"/"Next"以切换view range的时候，重新设定rangeStart & rangeEnd
    const onRangeChange = useCallback((dates, view) => {
        setRangeStart(dates[0]);
        setRangeEnd(dates[6]);
    }, []);

    return {
        localizer,
        selectedReservation,
        setSelectedReservation,
        events,
        setEvents,
        error,
        setError,
        onDetailsModalClose,
        onRangeChange,
    }
}