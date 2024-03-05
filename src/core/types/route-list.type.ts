import { RouteList } from "../entities/route-list.entity";

export class FrontenedRouteList {
    public id: number;
    public isEnded: boolean;
    public driver: {
        id: number;
        login: string;
    };
    public dispatcher: {
        id: number;
        login: string;
    };
    public car: {
        id: number;
        mark: string;
        model: string;
    };
    public route: {
        id: number;
        begPoint: string;
        endPoint: string;
    }

    constructor(routeList: RouteList) {
        this.id = routeList.id;
        this.isEnded = routeList.isEnded;
        this.car = routeList.car ? {
            id: routeList.car.id,
            model: routeList.car.model,
            mark: routeList.car.mark,
        } : {
            id: -1,
            model: "unknown",
            mark: "unkown",
        }
        this.driver = routeList.driver ? {
            id: routeList.driver.id,
            login: routeList.driver.login,
        } : {
            id: -1,
            login: "unknown",
        }
        this.route = routeList.route ? {
            id: routeList.route.id,
            begPoint: routeList.route.begPoint,
            endPoint: routeList.route.endPoint,
        } : {
            id: -1,
            begPoint: "unknown",
            endPoint: "unknown",
        }
        this.dispatcher = routeList.dispatcher ? {
            id: routeList.dispatcher.id,
            login: routeList.dispatcher.login,
        } : {
            id: -1,
            login: "unknown",
        }
    }
}