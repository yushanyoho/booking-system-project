type Method = 'GET' | 'POST';

/**对XMLHttpRequest进行了一次二次封装 */
export default class BookingSystemRequest {
    base: string = '/api'; // backend url start with '/api'
    path: string; // url path after '/api'
    request: XMLHttpRequest; // new XMLHttpRequest(), .addEventListener(), .open(), .send()
    payload: any | undefined; // POST body, request.send(payload)
    method: string; // GET / POST
    handleSuccess: (response: any) => void = () => {};
    handleFailure: (response: any, status: number) => void = () => {};
    isFormData: boolean;

    constructor(path: string, method: Method, isFormData=false) {
        this.request = new XMLHttpRequest();
        this.path = path;
        this.method = method;
        this.isFormData = isFormData;
    }

    setPayload(payload: any): BookingSystemRequest{
        // Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
        this.payload = JSON.stringify(payload);
        return this; // method chaining
    }

    // XMLHttpRequest: setHandleStart
    onStart(handleStart: () => void): BookingSystemRequest {
        this.request.addEventListener('loadstart', handleStart);
        return this; // method chaining
    }

    /** Returns a function who (takes an XMLHttpRequest and returns void) */
    onFinished(): (this: XMLHttpRequest) => void {
        const handleSuccess = this.handleSuccess;
        const handleFailure = this.handleFailure;

        // return的function将会在 'loadend' 发生时调用，此时已经脱离 BookingSystemRequests 的context，
        // 需要判断status然后在handleSuccess和handleFailure中选择一个，所以用 function closure
        // 将两个function封装在return function的context中，以供调用的时候使用
        return function (this: XMLHttpRequest) {
            if (this.status >= 200 && this.status < 300) {
                handleSuccess(this.response);
            } else {
                handleFailure(this.response, this.status);
            }
        }
    }

    /** setHandleSuccess ( a function to hendle the response when request success ) */
    onSuccess(handleSuccess: (response: any) => void): BookingSystemRequest {
        this.handleSuccess = handleSuccess;
        return this; // method chaining
    }

    /** setHandleFailure (a function to handle the response when request fail) */
    onFailure(handleFailure: (response: any, status: number) => void): BookingSystemRequest {
        this.handleFailure = handleFailure;
        return this; // method chaining
    }

    /** setHandleErrorInRequest (a functino to hendle the error message) */
    onError(handleError: (err: any) => void): BookingSystemRequest {
        this.request.addEventListener('error', handleError);
        return this; // method chaining
    }

    send() {
        this.request.open(this.method, `${this.base}/${this.path}`);

        // login是formData，其他requst都是json
        if (this.isFormData) {
            this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        } else {
            this.request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        }
        this.request.withCredentials = true; // 自动存储并调用浏览器中存储的cookie
        this.request.addEventListener('loadend', this.onFinished());
        this.request.send(this.payload);
    }

}