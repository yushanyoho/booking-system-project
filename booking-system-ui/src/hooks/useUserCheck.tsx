import { useEffect, useState, useCallback } from "react";
import { useHistory, useParams } from "react-router";
import BookingSystemRequest from "../utils/BookingSystemRequest";
import { RouteParams } from "../views/InstructorView";

// 查看当前访问的url中的用户名是否确实存在于数据库中
export default function useUserCheck (
    notFound: (parsedRes: any) => boolean
): boolean {
    const [isLoading, setIsLoading] = useState(false);

    // 从url拿到访问用户
    const { username: routeUsername } = useParams<RouteParams>();
    const history = useHistory();

    const onRequestSuccess = useCallback(
        (res: string) => {
            if (!Boolean(res)) {
                history.push('/');
                return;
            }
            const parsedRes = JSON.parse(res);
            // 查看当前访问的url中的用户名是否确实存在于数据库中，如果不存在则 parsedRes === null，notFound() 会return true
            if (notFound(parsedRes)) {
                history.push('/'); // re-direct to <NotFoundView />
            }
            // 返回的用户没有问题则结束loading，设置isLoading为false
            setIsLoading(false);
        }, []
    );

    useEffect(() => {
        setIsLoading(true); // 开始user check request的时候将isLoading设为true
        new BookingSystemRequest(`users/${routeUsername}`, 'GET') // '/api/users/yyy' 拿到访问用户的信息
            .onSuccess(onRequestSuccess)
            .onFailure(() => history.push('/'))
            .send()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading;
}