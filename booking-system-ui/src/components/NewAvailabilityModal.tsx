import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, } from "@mui/material";
import moment from "moment";
import { useCallback, useState } from "react";
import { SlotInfo } from "react-big-calendar";
import { useParams } from "react-router";
import BookingSystemRequest from "../utils/BookingSystemRequest";
import { availabilityToEvents, DATE_FORMAT, Event } from "../utils/CalendarUtils";
import { RouteParams } from "../views/InstructorView";

interface Props {
    slot: SlotInfo | null,
    onClose: () => void,
    setEvents: (cb: (events: Event[]) => Event[]) => void,
    setError: (err: string) => void,
}

export default function NewAvailabilityModal({
    slot,
    onClose,
    setEvents,
    setError,
}: Props): React.ReactElement {
    const [isLoading, setIsLoading] = useState(false);
    const { username: instructorName } = useParams<RouteParams>();

    const [ durationInput, setDurationInput ] = useState(30);

    const onDurationChange = useCallback((e) => {
        setDurationInput(e.target.value as number);
    }, [setDurationInput]
    );

    const onReequestFail = useCallback(() => {
        setIsLoading(false);
        setError('There has been an error creating your availability');
        onClose();
    }, [onClose, setError]);

    const onReequestSuccess = useCallback((res) => {
        setIsLoading(false);
        
        if (!Boolean(res)) {
            setError('There has been an error creating your availability');
        } else {
            // 当接受到valid response，将其parse为object并设置为newEvents
            const parsedRes = JSON.parse(res);
            // merge newEvents to current events
            setEvents((events) => [
                ...events, // Event[]
                ...availabilityToEvents(parsedRes) // Event[]
            ]);
        }
        onClose();
        
    }, [onClose, setError, setEvents]);

    const onSubmitNewAvailability = useCallback(() => {
        setIsLoading(true);

        new BookingSystemRequest(`${instructorName}/availabilities`, 'POST')
            // payload与后端要求提供的model对应
            .setPayload({
                fromUtc: moment(slot?.start).format(DATE_FORMAT),
                toUtc: moment(slot?.end).format(DATE_FORMAT),
                // hard code 为 30min 也可以作为model中的一个TextField
                durationMinutes: durationInput,
            })
            .onSuccess(onReequestSuccess)
            .onFailure(onReequestFail)
            .onError(onReequestFail)
            .send();
        }, 
        // 将 new BookingSystemRequest() 中用到的所有变量添加到dependency中（setPayload）
        // 否则 callback function 将一直使用初始值发送request，不能及时更新信息
        [instructorName, onReequestFail, onReequestSuccess, slot?.end, slot?.start, durationInput]
    );

    return (
        <Dialog fullWidth maxWidth='sm' open={slot != null} onClose={onClose}>
            <DialogTitle>New Availability</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    Are you sure you want to create the following avalilability?
                </DialogContentText>
                <DialogContentText>
                    From: {slot?.start.toLocaleString()}
                </DialogContentText>
                <DialogContentText>
                    To: {slot?.end.toLocaleString()}
                </DialogContentText>
                <FormControl sx={{ mt: 2 }} fullWidth>
                    <InputLabel id="duration-label">Duration</InputLabel>
                    <Select
                        labelId='duration-label'
                        id="duration"
                        fullWidth
                        label="Duration"
                        value={durationInput}
                        onChange={onDurationChange}
                    >
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={60}>60</MenuItem>
                        <MenuItem value={90}>90</MenuItem>
                        <MenuItem value={120}>120</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button disabled={isLoading} onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={isLoading} onClick={onSubmitNewAvailability}>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}