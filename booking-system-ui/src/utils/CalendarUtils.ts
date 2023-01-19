import moment from "moment";

export type EventType = 'Reservation' | 'Availability';

export const DATE_FORMAT = 'yyyy-MM-DD HH:mm';

export interface Event {
    title?: string,
    start: Date,
    end: Date,
    type: EventType,
    instructor?: string,
    student?: string,
    id?: number,
};

export interface Availability {
    id: number,
    utcStartTime: string, // 2023-01-11 23:00
    utcEndTime: string,
}

export type Reservation = Availability & {
    description: string,
    studentUsername: string, 
    instructorUsername: string
}

export function reservationToEvents(
    reservations: Array<Reservation>,
): Array<Event> {
    return reservations.map(
        (reservation) => {
            return {
                start: moment(reservation.utcStartTime).toDate(),
                end: moment(reservation.utcEndTime).toDate(),
                id: reservation.id,
                type: 'Reservation',
                title: reservation.description,
                student: reservation.studentUsername,
                instructor: reservation.instructorUsername,
            }
        }
    );
}

export function availabilityToEvents(
    availability: Array<Availability>,
): Array<Event> {
    return availability.map(
        (availability) => {
            return {
                start: moment(availability.utcStartTime).toDate(),
                end: moment(availability.utcEndTime).toDate(),
                id: availability.id,
                type: 'Availability' as EventType,
                title: 'Available',
            };
        }
    );
}